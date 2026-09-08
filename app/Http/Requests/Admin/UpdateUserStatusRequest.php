<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'account_status' => ['required', 'in:active,suspended,disabled'],
            'reason' => ['required_unless:account_status,active', 'nullable', 'string', 'max:2000'],
        ];
    }
}
