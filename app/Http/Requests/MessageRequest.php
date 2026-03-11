<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => 'nullable|string|max:5000',
            'files' => 'sometimes|array|max:5',
            'files.*' => 'file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi,webm|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'files.*.max' => 'Each file must not be greater than 10 MB.',
            'files.*.mimes' => 'Each file must be an image (JPEG, PNG, GIF, WebP) or video (MP4, MOV, AVI, WebM).',
        ];
    }
}

