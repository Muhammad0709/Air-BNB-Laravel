<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Contact",
 *     description="API endpoints for contact form submissions"
 * )
 */
class ContactController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/contact",
     *     summary="Get contact submissions",
     *     description="Returns contact form submissions for the authenticated user",
     *     tags={"Contact"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Limit the number of contacts returned (default: 10, max: 50)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contact submissions retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Contact submissions retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="contacts",
     *                     type="array",
     *                     description="List of contact submissions",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="John Doe"),
     *                         @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *                         @OA\Property(property="subject", type="string", example="Question about booking"),
     *                         @OA\Property(property="created_at", type="string", format="date-time"),
     *                         @OA\Property(
     *                             property="files",
     *                             type="array",
     *                             @OA\Items(
     *                                 @OA\Property(property="file_name", type="string", example="document.pdf"),
     *                                 @OA\Property(property="file_url", type="string", example="http://localhost:8000/storage/contacts/document.pdf"),
     *                                 @OA\Property(property="mime_type", type="string", example="application/pdf"),
     *                                 @OA\Property(property="file_size", type="integer", example=1024000)
     *                             )
     *                         )
     *                     )
     *                 )
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
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);
        
        $limit = $request->input('limit', 10);
        $userId = Auth::id();

        $contacts = Contact::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Contact submissions retrieved successfully',
            'data' => [
                'contacts' => ContactResource::collection($contacts),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/contact",
     *     summary="Submit a contact form",
     *     description="Submit a new contact form inquiry with optional file attachments",
     *     tags={"Contact"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "email", "subject"},
     *                 @OA\Property(property="name", type="string", example="John Doe", description="Contact name (min: 2, max: 255)"),
     *                 @OA\Property(property="email", type="string", format="email", example="john.doe@example.com", description="Contact email"),
     *                 @OA\Property(property="subject", type="string", example="Question about booking", description="Subject line (min: 5, max: 255)"),
     *                 @OA\Property(
     *                     property="files[]",
     *                     type="array",
     *                     description="Optional file attachments (max 5 files, max 10MB each)",
     *                     @OA\Items(type="string", format="binary"),
     *                     example={"file1.pdf", "file2.jpg"}
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Contact form submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Contact form submitted successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *                 @OA\Property(property="subject", type="string", example="Question about booking"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="files",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="file_name", type="string", example="document.pdf"),
     *                         @OA\Property(property="file_url", type="string", example="http://localhost:8000/storage/contacts/document.pdf"),
     *                         @OA\Property(property="mime_type", type="string", example="application/pdf"),
     *                         @OA\Property(property="file_size", type="integer", example=1024000)
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(ContactRequest $request): JsonResponse
    {
        $userId = Auth::id();

        $files = [];
        
        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filePath = $file->store('contacts', 'public');
                
                $files[] = [
                    'file_path' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ];
            }
        }

        $contact = Contact::create([
            'user_id' => $userId,
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'subject' => $request->input('subject'),
            'files' => !empty($files) ? $files : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Contact form submitted successfully',
            'data' => new ContactResource($contact),
        ], 201);
    }
}
