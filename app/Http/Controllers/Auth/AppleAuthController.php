<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AppleAuthController extends Controller
{
    private const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';
    private const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
    private const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';

    public function redirect(Request $request)
    {
        $intent = $request->query('intent');
        if (! in_array($intent, ['host', 'customer', 'company'], true)) {
            return redirect()->route('login')->withErrors(['email' => 'Please choose a role before using Sign in with Apple.']);
        }

        if (! $this->isConfigured()) {
            return redirect()->route('login')->withErrors(['email' => 'Apple Sign In is not configured yet.']);
        }

        $state = Str::random(64);
        $request->session()->put('apple_login', ['state' => $state, 'intent' => $intent]);

        return redirect()->away(self::APPLE_AUTH_URL.'?'.http_build_query([
            'client_id' => config('services.apple.client_id'),
            'redirect_uri' => config('services.apple.redirect'),
            'response_type' => 'code',
            'response_mode' => 'form_post',
            'scope' => 'name email',
            'state' => $state,
        ]));
    }

    public function callback(Request $request)
    {
        $flow = $request->session()->pull('apple_login');
        if (! is_array($flow) || ! hash_equals((string) ($flow['state'] ?? ''), (string) $request->input('state'))) {
            return redirect()->route('login')->withErrors(['email' => 'Apple sign-in session expired. Please try again.']);
        }

        if ($request->filled('error')) {
            return redirect()->route('login')->withErrors(['email' => 'Apple sign-in was cancelled or failed.']);
        }

        try {
            $tokenResponse = Http::asForm()->timeout(15)->post(self::APPLE_TOKEN_URL, [
                'client_id' => config('services.apple.client_id'),
                'client_secret' => $this->clientSecret(),
                'code' => $request->input('code'),
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.apple.redirect'),
            ])->throw()->json();

            $claims = $this->verifyIdentityToken((string) ($tokenResponse['id_token'] ?? ''));
            $appleId = (string) ($claims['sub'] ?? '');
            $email = isset($claims['email']) ? (string) $claims['email'] : null;
            $userData = $request->input('user');
            $userData = is_string($userData) ? json_decode($userData, true) : (is_array($userData) ? $userData : []);
            $name = trim(implode(' ', array_filter([
                data_get($userData, 'name.firstName'), data_get($userData, 'name.lastName'),
            ]))) ?: 'Apple User';

            if ($appleId === '') {
                throw new \RuntimeException('Apple user identifier is missing.');
            }

            $user = User::where('apple_id', $appleId)->first()
                ?? ($email ? User::where('email', $email)->first() : null);
            $isNewUser = ! $user;
            $type = match ($flow['intent']) {
                'host' => UserType::HOST,
                'company' => UserType::COMPANY,
                default => UserType::USER,
            };

            if ($user && $user->type === UserType::ADMIN) {
                return redirect()->route('admin.login')->withErrors(['email' => 'Administrators must sign in with email and password.']);
            }

            if ($user && $this->roleConflicts($user->type, $type)) {
                return redirect()->route('login')->withErrors(['email' => 'This Apple account is already registered with a different role.']);
            }

            if (! $user) {
                if (! $email) {
                    return redirect()->route('login')->withErrors(['email' => 'Apple did not provide an email address. Please use email/password once to link your account.']);
                }
                $user = User::create([
                    'name' => $name, 'email' => $email, 'apple_id' => $appleId,
                    'password' => Hash::make(Str::random(32)), 'type' => $type,
                    'company_name' => $type === UserType::COMPANY ? $name : null,
                ]);
            } elseif (! $user->apple_id) {
                $user->update(['apple_id' => $appleId]);
            }

            abort_unless(($user->account_status ?? 'active') === 'active', 403, 'Your account is suspended or disabled.');
            Auth::login($user, true);
            $request->session()->regenerate();

            if ($type === UserType::COMPANY) {
                return redirect()->route('host.dashboard')->with('success', __('auth.signin.toast_signed_in'));
            }
            if ($type === UserType::HOST) {
                return redirect()->route('host.dashboard')->with('success', __('auth.signin.toast_signed_in'));
            }
            return redirect('/')->with('success', __('auth.signin.toast_signed_in'));
        } catch (\Throwable $e) {
            report($e);
            return redirect()->route('login')->withErrors(['email' => 'Apple sign-in failed. Please try again or use email/password.']);
        }
    }

    private function isConfigured(): bool
    {
        return (bool) config('services.apple.client_id') && (bool) config('services.apple.team_id')
            && (bool) config('services.apple.key_id') && (bool) $this->privateKey();
    }

    private function clientSecret(): string
    {
        $now = time();
        return JWT::encode([
            'iss' => config('services.apple.team_id'), 'iat' => $now,
            'exp' => $now + 86400 * 180, 'aud' => 'https://appleid.apple.com',
            'sub' => config('services.apple.client_id'),
        ], $this->privateKey(), 'ES256', config('services.apple.key_id'));
    }

    private function privateKey(): string
    {
        $key = (string) config('services.apple.private_key', '');
        $path = (string) config('services.apple.private_key_path', '');
        if ($key === '' && $path !== '' && is_file(base_path($path))) {
            $key = (string) file_get_contents(base_path($path));
        }
        return str_replace('\\n', "\n", $key);
    }

    private function verifyIdentityToken(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) throw new \RuntimeException('Invalid Apple identity token.');
        $header = json_decode(JWT::urlsafeB64Decode($parts[0]), true);
        $kid = $header['kid'] ?? null;
        $keys = Http::timeout(10)->get(self::APPLE_KEYS_URL)->throw()->json();
        $parsedKeys = JWK::parseKeySet($keys, 'RS256');
        if (! $kid || ! isset($parsedKeys[$kid])) throw new \RuntimeException('Apple signing key not found.');
        $claims = (array) JWT::decode($token, [$kid => $parsedKeys[$kid]]);
        if (($claims['iss'] ?? null) !== 'https://appleid.apple.com' || ($claims['aud'] ?? null) !== config('services.apple.client_id')) {
            throw new \RuntimeException('Invalid Apple token claims.');
        }
        return $claims;
    }

    private function roleConflicts(UserType $existing, UserType $requested): bool
    {
        return $existing !== $requested && ($existing->isHostPanelUser() || $requested->isHostPanelUser() || $existing === UserType::USER || $requested === UserType::USER);
    }
}
