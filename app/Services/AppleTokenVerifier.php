<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

final class AppleTokenVerifier
{
    private const PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

    /**
     * Verify an Apple identity token and return its trusted claims.
     *
     * @param  array<int, string>  $audiences
     * @return array<string, mixed>
     */
    public function verify(string $token, array $audiences): array
    {
        if ($token === '' || $audiences === []) {
            throw new InvalidArgumentException('Apple identity token configuration is missing.');
        }

        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new InvalidArgumentException('Invalid Apple identity token.');
            }

            $header = json_decode(JWT::urlsafeB64Decode($parts[0]), true, 512, JSON_THROW_ON_ERROR);
            $kid = is_array($header) ? ($header['kid'] ?? null) : null;
            if (!is_string($kid) || $kid === '') {
                throw new InvalidArgumentException('Apple signing key is missing.');
            }

            $keys = Http::timeout(10)->get(self::PUBLIC_KEYS_URL)->throw()->json();
            $parsedKeys = JWK::parseKeySet($keys, 'RS256');
            if (!isset($parsedKeys[$kid])) {
                throw new InvalidArgumentException('Apple signing key not found.');
            }

            $claims = (array) JWT::decode($token, [$kid => $parsedKeys[$kid]]);
            $audience = $claims['aud'] ?? null;
            $audienceIsValid = is_array($audience)
                ? count(array_intersect($audience, $audiences)) > 0
                : is_string($audience) && in_array($audience, $audiences, true);

            if (($claims['iss'] ?? null) !== 'https://appleid.apple.com' || !$audienceIsValid) {
                throw new InvalidArgumentException('Invalid Apple token claims.');
            }

            return $claims;
        } catch (InvalidArgumentException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new InvalidArgumentException('Invalid Apple identity token.', 0, $e);
        }
    }
}
