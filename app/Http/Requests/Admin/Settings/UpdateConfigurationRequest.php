<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateConfigurationRequest extends FormRequest
{
    private const FIELDS = ['countries', 'languages', 'currencies', 'property_types', 'amenities'];
    private const UPPERCASE = ['countries', 'currencies'];
    private const LOWERCASE = ['languages', 'property_types'];
    private const PATTERNS = [
        'countries' => '/^[A-Z]{2}$/',
        'languages' => '/^[a-z]{2,5}$/',
        'currencies' => '/^[A-Z]{3}$/',
        'property_types' => '/^[a-z0-9][a-z0-9 _-]*$/',
    ];
    private const LANGUAGES = ['en', 'ar', 'ur', 'fa', 'tr', 'ku'];

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
            'commission_rate' => 'required|numeric|min:0|max:100',
            ...array_fill_keys(self::FIELDS, 'nullable|string|max:5000'),
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (self::FIELDS as $field) {
            if (! is_string($this->input($field))) {
                continue;
            }

            $values = array_values(array_unique(array_filter($this->values($field))));

            if (in_array($field, self::UPPERCASE, true)) {
                $values = array_map('strtoupper', $values);
            } elseif (in_array($field, self::LOWERCASE, true)) {
                $values = array_map('strtolower', $values);
            }

            $this->merge([$field => implode(', ', array_unique($values))]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            foreach (self::PATTERNS as $field => $pattern) {
                foreach ($this->values($field) as $value) {
                    if (! preg_match($pattern, $value)) {
                        $validator->errors()->add($field, "Invalid {$field} value: {$value}.");
                    }
                    if ($field === 'languages' && ! in_array($value, self::LANGUAGES, true)) {
                        $validator->errors()->add($field, "Language {$value} is not available in the application.");
                    }
                }
            }
        });
    }

    private function values(string $field): array
    {
        return array_filter(array_map('trim', preg_split('/[,\n]+/', (string) $this->input($field)) ?: []));
    }
}
