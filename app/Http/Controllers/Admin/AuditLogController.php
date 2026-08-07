<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        $logs = AuditLog::latest()->paginate(20);

        $logs->getCollection()->transform(fn (AuditLog $log) => [
            'id' => $log->id,
            'actor_name' => $log->actor_name,
            'action' => $log->action,
            'subject_label' => $log->subject_label,
            'description' => $log->description,
            'created_at' => $log->created_at->format('Y-m-d H:i'),
        ]);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
