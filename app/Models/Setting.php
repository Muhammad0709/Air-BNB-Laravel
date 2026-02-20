<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'string',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::find($key);
        if (!$row || $row->value === null || $row->value === '') {
            return $default;
        }
        $v = $row->value;
        if (is_numeric($v)) {
            return str_contains($v, '.') ? (float) $v : (int) $v;
        }
        return $v;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value === null ? null : (string) $value]
        );
    }
}
