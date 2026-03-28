<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="API endpoints for user authentication"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register a new user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "type"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="type", type="string", enum={"User", "Admin", "Host"}, example="User", description="User type: User, Admin, or Host")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="User registered successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User"),
     *                 @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users,name'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'min:8',
                function ($attribute, $value, $fail) {
                    if (!preg_match('/^[A-Z]/', $value)) {
                        $fail('The password must start with an uppercase letter.');
                    }
                    if (!preg_match('/[0-9]/', $value)) {
                        $fail('The password must contain at least one number.');
                    }
                    if (!preg_match('/[^A-Za-z0-9]/', $value)) {
                        $fail('The password must contain at least one special character.');
                    }
                },
            ],
            'type' => ['required', 'string', 'in:' . implode(',', array_column(UserType::cases(), 'value'))],
        ], [
            'name.unique' => 'This name is already taken. Please choose another name.',
            'email.unique' => 'This email is already registered.',
            'password.min' => 'The password must be at least 8 characters long.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => $request->type,
        ]);

        // Create token for API authentication
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="type", type="string", enum={"User", "Admin", "Host"}, example="User", description="Optional: Filter login by user type. If provided, only users of this type can login.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User"),
     *                 @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Invalid credentials")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied - User type mismatch",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This account is for User users, not Host users.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'type' => ['sometimes', 'string', 'in:' . implode(',', array_column(UserType::cases(), 'value'))],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check user type if provided
        if ($request->filled('type')) {
            $requestedType = $request->input('type');
            if ($user->type->value !== $requestedType) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Access denied. This account is for {$user->type->value} users, not {$requestedType} users."
                ], 403);
            }
        }

        // Delete existing tokens (optional - for single device login)
        // $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout user",
     *     tags={"Authentication"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function logout(Request $request)
    {
        // Delete current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Get authenticated user",
     *     tags={"Authentication"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="User retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $request->user()
            ]
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/password/forgot",
     *     summary="Send password reset link",
     *     description="Sends a password reset token to the user's email",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset link sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Password reset link has been sent to your email")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="We could not find a user with that email address.")
     *         )
     *     )
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->input('email');

        // Check if user exists
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'We could not find a user with that email address.'
            ], 404);
        }

        // Generate reset token
        $token = Str::random(64);

        // Delete existing tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        // Insert new token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now()
        ]);

        // TODO: Send email with reset link
        // For now, we'll return the token in response (remove this in production)
        // In production, send email with: {frontend_url}/reset-password?token={token}&email={email}

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset link has been sent to your email',
            'data' => [
                'token' => $token, // Remove this in production - only for testing
                'email' => $email
            ]
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/password/reset",
     *     summary="Reset password",
     *     description="Resets user password using the reset token",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "token", "password", "password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="token", type="string", example="reset-token-string"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Password has been reset successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error or invalid token",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Invalid or expired reset token")
     *         )
     *     )
     * )
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $email = $request->input('email');
        $token = $request->input('token');
        $password = $request->input('password');

        // Get the reset token from database
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired reset token'
            ], 422);
        }

        // Check if token is valid (within 60 minutes)
        $createdAt = Carbon::parse($passwordReset->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            // Token expired, delete it
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            return response()->json([
                'status' => 'error',
                'message' => 'Reset token has expired. Please request a new one.'
            ], 422);
        }

        // Verify token
        if (!Hash::check($token, $passwordReset->token)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid reset token'
            ], 422);
        }

        // Update user password
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $user->password = Hash::make($password);
        $user->save();

        // Delete the reset token
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Password has been reset successfully'
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/social-login",
     *     summary="Social login (Google)",
     *     description="Authenticate user using Google OAuth token",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"provider", "token", "type"},
     *             @OA\Property(property="provider", type="string", enum={"google"}, example="google", description="Social provider (currently only Google is supported)"),
     *             @OA\Property(property="token", type="string", example="eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...", description="Google ID token obtained from Google Sign-In"),
     *             @OA\Property(property="type", type="string", enum={"User", "Host"}, example="User", description="User type: User or Host"),
     *             @OA\Property(property="device_type", type="string", enum={"ios", "android", "web"}, example="web", description="Device type (optional)"),
     *             @OA\Property(property="devices_token", type="string", example="device_token_123", description="Device token for push notifications (optional)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Google login successful"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", description="Sanctum authentication token"),
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John Doe"),
     *                     @OA\Property(property="email", type="string", example="john@example.com"),
     *                     @OA\Property(property="type", type="string", example="User"),
     *                     @OA\Property(property="profile_picture", type="string", example="https://lh3.googleusercontent.com/...")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid Google token",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Invalid Google token"),
     *             @OA\Property(property="error", type="string", example="Token verification failed")
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Role conflict - user exists with different type",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="An account with this email already exists with a different role")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="provider", type="array", @OA\Items(type="string", example="The provider field is required.")),
     *                 @OA\Property(property="token", type="array", @OA\Items(type="string", example="The token field is required.")),
     *                 @OA\Property(property="type", type="array", @OA\Items(type="string", example="The type field is required."))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Google login failed"),
     *             @OA\Property(property="error", type="string", example="Detailed error message")
     *         )
     *     )
     * )
     */
    public function socialLogin(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google',
                'token' => 'required|string',
                'type' => 'required|string|in:User,Host',
                'device_type' => 'nullable|string|in:ios,android,web',
                'devices_token' => 'nullable|string',
            ]);

            $provider = strtolower($request->provider);
            $userType = $request->type;

            if ($provider === 'google') {
                return $this->loginWithGoogle($request);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Provider not supported',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Social login failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login with Google
     */
    private function loginWithGoogle(Request $request)
    {
        try {
            $accessToken = $request->input('token');
            $userType = $request->input('type', 'User');

            // Verify Google token - allow multiple client IDs
            $clientIds = [
                config('services.google.client_id'),
                '731015124326-b8acb9e7hflv9ei2lnfrq12kmtouri8k.apps.googleusercontent.com', // Web client
                '731015124326-6ak3bfcpr9p446c04ood7iimif2ij6o8.apps.googleusercontent.com', // Android client
            ];
            
            $payload = null;
            $lastError = null;
            
            foreach ($clientIds as $clientId) {
                try {
                    $client = new \Google_Client(['client_id' => $clientId]);
                    $payload = $client->verifyIdToken($accessToken);
                    
                    if ($payload) {
                        \Log::info('Google token verified successfully with client_id: ' . $clientId);
                        break;
                    }
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    \Log::warning('Failed to verify with client_id ' . $clientId . ': ' . $e->getMessage());
                    continue;
                }
            }
            
            if (!$payload) {
                \Log::error('Google token verification failed for all client IDs. Last error: ' . $lastError);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Google token',
                    'error' => 'Token verification failed: ' . ($lastError ?? 'Token payload is empty'),
                ], 401);
            }

            $googleId = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? 'Google User';
            $profileImage = $payload['picture'] ?? null;

            if (!$googleId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Google token',
                    'error' => 'Google ID not found in token',
                ], 401);
            }

            // Find or create user
            $user = User::where('google_id', $googleId)->first();

            if (!$user && $email) {
                $user = User::where('email', $email)->first();
                
                // If user exists with different type, prevent role conflict
                if ($user && $user->type->value !== $userType) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'An account with this email already exists with a different role',
                    ], 409);
                }
            }

            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'profile_picture' => $profileImage,
                    'password' => Hash::make(Str::random(24)),
                    'type' => $userType,
                ]);
            } else {
                // Update existing user with Google data if needed
                $updateData = [];

                if (!$user->google_id) {
                    $updateData['google_id'] = $googleId;
                }

                if (!$user->profile_picture && $profileImage) {
                    $updateData['profile_picture'] = $profileImage;
                }

                if ($user->type->value !== $userType) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Role conflict detected',
                    ], 409);
                }

                if (!empty($updateData)) {
                    $user->update($updateData);
                }
            }

            $token = $user->createToken('google_auth')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Google login successful',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => $user->type->value,
                        'profile_picture' => $user->profile_picture,
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Google login failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Google login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


