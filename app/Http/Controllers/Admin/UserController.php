<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\AuditLog;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Hosts have a dedicated management section; keep them out of the general users list.
        $query->whereIn('type', [UserType::USER->value, UserType::COMPANY->value]);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $filters = $request->validate(['account_status' => ['nullable', 'in:active,suspended,disabled'], 'type' => ['nullable', 'in:User,Company']]);
        foreach ($filters as $key => $value) {
            if ($value) { $query->where($key, $value); }
        }
        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'account_status', 'type']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', __('admin.users.flash_updated'));
    }

    /**
     * Update user status.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        abort_if($user->id === $request->user()->id || in_array($user->type, [UserType::ADMIN, UserType::MODERATOR], true), 403);
        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user) {
            $user = User::lockForUpdate()->findOrFail($user->id);
            abort_if($user->account_status === 'disabled', 422, 'Permanently disabled accounts cannot be reactivated.');
            $user->forceFill([
                'account_status' => $request->validated('account_status'),
                'account_status_reason' => $request->validated('account_status') === 'active' ? null : $request->validated('reason'),
            ])->save();
            if ($user->account_status !== 'active') {
                $user->tokens()->delete();
                if (config('session.driver') === 'database') {
                    \Illuminate\Support\Facades\DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
                }
            }
            AuditLog::record($request->user(), 'account_'.$user->account_status, (string) $user->id, $request->validated('reason'));
        });

        return redirect()->back()
            ->with('success', __('admin.users.flash_status_updated'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $label = "{$user->name} ({$user->email})";

        $user->delete();

        AuditLog::record(Auth::user(), 'user_deleted', $label);

        return redirect()->route('admin.users.index')->with('success', __('admin.users.flash_deleted'));
    }
}
