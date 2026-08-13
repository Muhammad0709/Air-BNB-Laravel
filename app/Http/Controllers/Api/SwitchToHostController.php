<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\UserType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Host Switch",
 *     description="API endpoints for switching between customer and host preview mode"
 * )
 */
class SwitchToHostController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/switch-to-host",
     *     summary="Switch to host preview mode",
     *     description="Allows a customer account to enter host panel preview mode. Only works for user-type accounts. Does not change the account type permanently.",
     *     tags={"Host Switch"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Switched to host preview successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Host preview mode enabled"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="host_preview", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Only customer accounts can enable host preview")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->type !== UserType::USER) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only customer accounts can open the host preview.',
            ], 403);
        }

        // For stateless APIs, we return a flag the client can store locally.
        // If the app uses sessions (web + API hybrid), we also set the session key.
        if ($request->hasSession()) {
            $request->session()->put('host_panel_preview', true);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Host preview mode enabled',
            'data'    => ['host_preview' => true],
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/switch-to-host",
     *     summary="Exit host preview mode",
     *     description="Returns the customer back to guest-only views. Account type is unchanged.",
     *     tags={"Host Switch"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Exited host preview mode",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Host preview mode disabled"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="host_preview", type="boolean", example=false)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Only customer accounts can leave host preview")
     * )
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->type !== UserType::USER) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only customer accounts can leave the host preview.',
            ], 403);
        }

        if ($request->hasSession()) {
            $request->session()->forget('host_panel_preview');
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Host preview mode disabled',
            'data'    => ['host_preview' => false],
        ], 200);
    }
}
