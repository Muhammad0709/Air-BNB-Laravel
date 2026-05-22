<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Currency",
 *     description="API endpoints for currency exchange rates"
 * )
 */
class CurrencyController extends Controller
{
    public function __construct(
        private readonly ExchangeRateService $exchangeRateService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/currencies",
     *     summary="Get all supported currencies with exchange rates",
     *     description="Returns all supported currencies with their exchange rates against 1 USD",
     *     tags={"Currency"},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Exchange rates retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Exchange rates retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="base_currency", type="string", example="USD"),
     *                 @OA\Property(property="rates", type="object",
     *                     @OA\Property(property="USD", type="number", example=1),
     *                     @OA\Property(property="IQD", type="number", example=1311.079185),
     *                     @OA\Property(property="TRY", type="number", example=45.592355),
     *                     @OA\Property(property="PKR", type="number", example=278.719962),
     *                     @OA\Property(property="EUR", type="number", example=0.861198),
     *                     @OA\Property(property="GBP", type="number", example=0.746281)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $rates = $this->exchangeRateService->getRates();

        return response()->json([
            'status' => 'success',
            'message' => 'Exchange rates retrieved successfully',
            'data' => [
                'base_currency' => 'USD',
                'rates' => $rates,
            ],
        ], 200);
    }
}
