<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'actor_id',
        'actor_name',
        'action',
        'subject_label',
        'description',
    ];

    public static function record(User $actor, string $action, string $subjectLabel, ?string $description = null): void
    {
        static::create([
            'actor_id' => $actor->id,
            'actor_name' => $actor->name,
            'action' => $action,
            'subject_label' => $subjectLabel,
            'description' => $description,
        ]);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
