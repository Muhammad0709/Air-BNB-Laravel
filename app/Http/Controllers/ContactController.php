<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display the contact form.
     */
    public function index()
    {
        return Inertia::render('Contact');
    }

    /**
     * Store a new contact message.
     */
    public function store(ContactRequest $request)
    {
        $validated = $request->validated();
        
        // Handle file uploads
        $filesData = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('contact-files', 'public');
                $filesData[] = [
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ];
            }
        }

        // Create contact record
        $contact = Contact::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'files' => !empty($filesData) ? $filesData : null,
        ]);

        // Redirect back with success message (Inertia will handle the flash message)
        return redirect()->route('contact')
            ->with('success', 'Thank you for your message! We will get back to you soon.');
    }
}
