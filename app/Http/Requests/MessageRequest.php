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
            'message' => 'sometimes|string|max:5000',
            'files' => 'sometimes|array|max:5',
            'files.*' => 'file|mimes:jpeg,jpg,png,gif,mp4,mov,avi|max:10240',
        ];
    }
}

