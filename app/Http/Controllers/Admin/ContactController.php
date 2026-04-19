<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $search = (string) $request->input('search', '');

        $query = Contact::query()
            ->with(['user:id,name,email'])
            ->orderByDesc('created_at');

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('subject', 'like', $like);
            });
        }

        $contacts = $query->paginate(10)->withQueryString();

        $contacts->getCollection()->transform(function (Contact $c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'subject' => $c->subject,
                'created_at' => $c->created_at?->toIso8601String(),
                'account_user_name' => $c->user?->name,
            ];
        });

        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Contact $contact)
    {
        $contact->load(['user:id,name,email']);

        $files = [];
        foreach ($contact->files ?? [] as $f) {
            $path = $f['file_path'] ?? null;
            $files[] = [
                'file_name' => $f['file_name'] ?? ($path ? basename((string) $path) : ''),
                'url' => $path ? Storage::disk('public')->url($path) : null,
                'mime_type' => $f['mime_type'] ?? null,
                'file_size' => $f['file_size'] ?? null,
            ];
        }

        return Inertia::render('Admin/Contacts/Show', [
            'contact' => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'subject' => $contact->subject,
                'message' => $contact->message,
                'files' => $files,
                'user' => $contact->user ? [
                    'id' => $contact->user->id,
                    'name' => $contact->user->name,
                    'email' => $contact->user->email,
                ] : null,
                'created_at' => $contact->created_at?->toIso8601String(),
            ],
        ]);
    }
}
