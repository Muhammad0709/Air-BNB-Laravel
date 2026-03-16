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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'files.*.max' => __('validation.files_max_message'),
            'files.*.mimes' => __('validation.files_mimes_message'),
        ];
    }
}

