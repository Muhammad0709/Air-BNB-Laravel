<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['user', 'host', 'company'])],
            'name' => ['bail', 'required', 'string', 'regex:/^\p{L}(?:[\p{L} ]*\p{L})?$/u', 'max:255'],
            'email' => ['bail', 'required', 'string', 'regex:/^[A-Za-z0-9._-]+@/', 'email', 'regex:/\.[A-Za-z]{2,}$/', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => ['nullable', 'required_if:type,company', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
