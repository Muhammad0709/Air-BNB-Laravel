<?php

namespace App\Http\Requests\Host\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateProfileRequest extends FormRequest
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
        $user = Auth::user();

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'company_name' => $user->type === \App\Enums\UserType::COMPANY ? 'required|string|max:255' : 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:255',
        ];
    }
}
