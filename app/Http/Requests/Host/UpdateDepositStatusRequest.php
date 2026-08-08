<?php

namespace App\Http\Requests\Host;

use App\Enums\DepositStatus;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDepositStatusRequest extends FormRequest
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
            'deposit_status' => ['required', 'in:' . implode(',', [DepositStatus::RETURNED->value, DepositStatus::DISPUTED->value])],
            'deposit_dispute_reason' => ['nullable', 'required_if:deposit_status,' . DepositStatus::DISPUTED->value, 'string', 'max:2000'],
        ];
    }
}
