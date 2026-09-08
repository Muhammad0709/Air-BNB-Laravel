<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HostController extends Controller
{
    private const RESOURCE_PATH = '/admin/hosts';

    public function index(Request $request)
    {
        $query = User::whereIn('type', [UserType::HOST->value, UserType::COMPANY->value]);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $filters = $request->validate([
            'account_status' => ['nullable', 'in:active,suspended,disabled'],
        ]);

        if (!empty($filters['account_status'])) {
            $query->where('account_status', $filters['account_status']);
        }

        return $this->renderList($query->latest()->paginate(10)->withQueryString(), $request);
    }

    public function show(User $host)
    {
        $this->ensureHost($host);

        return Inertia::render('Admin/Users/Show', [
            'user' => $host,
            ...$this->pageConfig(),
        ]);
    }

    public function edit(User $host)
    {
        $this->ensureHost($host);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $host,
            ...$this->pageConfig(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $host)
    {
        $this->ensureHost($host);
        $host->update($request->validated());

        return redirect()->route('admin.hosts.index')
            ->with('success', __('admin.users.flash_updated'));
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $host)
    {
        $this->ensureHost($host);
        abort_if($host->id === $request->user()->id, 403);

        DB::transaction(function () use ($request, $host): void {
            $host = User::lockForUpdate()->findOrFail($host->id);
            abort_if($host->account_status === 'disabled', 422, 'Permanently disabled accounts cannot be reactivated.');

            $status = $request->validated('account_status');
            $host->forceFill([
                'account_status' => $status,
                'account_status_reason' => $status === 'active' ? null : $request->validated('reason'),
            ])->save();

            if ($status !== 'active') {
                $host->tokens()->delete();
            }

            AuditLog::record($request->user(), 'account_'.$status, (string) $host->id, $request->validated('reason'));
        });

        return redirect()->back()->with('success', __('admin.users.flash_status_updated'));
    }

    public function destroy(User $host)
    {
        $this->ensureHost($host);
        $label = "{$host->name} ({$host->email})";

        $host->delete();
        AuditLog::record(Auth::user(), 'host_deleted', $label);

        return redirect()->route('admin.hosts.index')
            ->with('success', __('admin.users.flash_deleted'));
    }

    private function renderList($hosts, Request $request)
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => $hosts,
            'filters' => $request->only(['search', 'account_status']),
            ...$this->pageConfig(),
        ]);
    }

    private function pageConfig(): array
    {
        return [
            'managementType' => 'hosts',
            'resourcePath' => self::RESOURCE_PATH,
            'pageTitle' => __('admin.hosts.title'),
            'listTitle' => __('admin.hosts.all_hosts'),
            'searchPlaceholder' => __('admin.hosts.search_placeholder'),
            'noItemsLabel' => __('admin.hosts.no_hosts_found'),
            'viewTitle' => __('admin.hosts.view_host'),
            'editTitle' => __('admin.hosts.edit_host'),
            'backLabel' => __('admin.hosts.back_to_hosts'),
            'deleteConfirm' => __('admin.hosts.delete_confirm'),
            'deleteItemName' => __('admin.hosts.item_name'),
        ];
    }

    private function ensureHost(User $host): void
    {
        abort_unless(in_array($host->type, [UserType::HOST, UserType::COMPANY], true), 404);
    }
}
