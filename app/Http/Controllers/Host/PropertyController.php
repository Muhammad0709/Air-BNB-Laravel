<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHostPropertyRequest;
use App\Http\Requests\UpdateHostPropertyRequest;
use App\Models\Property;
use App\Models\User;
use App\Enums\CancellationPolicy;
use App\Enums\PropertyType;
use App\Enums\PropertyStatus;
use App\Enums\UserType;
use App\Events\NotificationEvent;
use App\Services\DuplicateListingDetector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function __construct(private DuplicateListingDetector $duplicateDetector)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $host = Auth::user();
        
        $query = Property::where('user_id', $host->id);
        
        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        
        // Filter by approval status
        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->get('approval_status'));
        }
        
        $properties = $query->latest()->paginate(10)->withQueryString();
        
        $properties->getCollection()->each(function ($property) {
            if ($property->image) {
                $property->image = Storage::url($property->image);
            }
            if ($property->images && is_array($property->images)) {
                $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
            }
        });
        
        return Inertia::render('Host/Properties/Index', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'status', 'approval_status']),
            'statusOptions' => ['Active', 'Inactive'],
            'approvalStatusOptions' => array_column(PropertyStatus::cases(), 'value'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Host/Properties/Create', [
            'propertyTypes' => array_column(PropertyType::cases(), 'value'),
            'timezones' => \DateTimeZone::listIdentifiers(),
            'cancellationPolicies' => CancellationPolicy::values(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreHostPropertyRequest $request)
    {
        $host = Auth::user();

        $maxBytes = 2 * 1024 * 1024;
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if ($file->getSize() > $maxBytes) {
                    throw ValidationException::withMessages([
                        "images.{$index}" => [__('host.property.image_max_size')],
                    ]);
                }
            }
        }

        $validated = $request->validated();
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('properties', 'public');
            }
        }
        $validated['images'] = $imagePaths;
        $validated['image'] = $imagePaths[0] ?? null;
        $validated['user_id'] = $host->id;
        $validated['timezone'] = $validated['timezone'] ?? 'UTC';
        $validated['cancellation_policy'] = $validated['cancellation_policy'] ?? CancellationPolicy::MODERATE->value;
        $validated['deposit_amount'] = $validated['deposit_amount'] ?? 0;
        $validated['status'] = 'Active';
        $validated['approval_status'] = PropertyStatus::PENDING->value;
        $validated['airport_pickup_enabled'] = $validated['airport_pickup_enabled'] ?? false;
        $validated['guided_tours_enabled'] = $validated['guided_tours_enabled'] ?? false;
        $validated['duplicate_flag_reason'] = $this->duplicateDetector->detect(
            $validated['title'],
            $validated['location'],
            $host->id,
            $request->hasFile('images') ? $request->file('images') : []
        );

        $property = Property::create($validated);

        // Send notification to admin about new property pending approval
        $admins = User::where('type', UserType::ADMIN->value)->get();
        
        if ($admins->isNotEmpty()) {
            $recipients = ['admins' => $admins];
            event(new NotificationEvent(
                $property,
                'property_pending_approval',
                $recipients
            ));
        }
        
        return redirect()->route('host.properties.index')
            ->with('success', __('host.property.created_success'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        // Ensure host can only view their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }
        
        $property->image = $property->image ? Storage::url($property->image) : null;
        if ($property->images && is_array($property->images)) {
            $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
        }
        return Inertia::render('Host/Properties/Show', [
            'property' => $property,
            'blockedDates' => $property->blockedDates()->orderBy('start_date')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        // Ensure host can only edit their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }
        
        $property->image = $property->image ? Storage::url($property->image) : null;
        if ($property->images && is_array($property->images)) {
            $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
        }
        return Inertia::render('Host/Properties/Edit', [
            'property' => $property,
            'propertyTypes' => array_column(PropertyType::cases(), 'value'),
            'timezones' => \DateTimeZone::listIdentifiers(),
            'cancellationPolicies' => CancellationPolicy::values(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHostPropertyRequest $request, Property $property)
    {
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }

        $validated = $request->validated();
        $imagePaths = $property->images ?? [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('properties', 'public');
            }
        }
        $validated['images'] = $imagePaths;
        $validated['image'] = $imagePaths[0] ?? null;
        $validated['timezone'] = $validated['timezone'] ?? $property->timezone ?? 'UTC';
        $validated['cancellation_policy'] = $validated['cancellation_policy'] ?? $property->cancellation_policy ?? CancellationPolicy::MODERATE->value;
        $validated['deposit_amount'] = $validated['deposit_amount'] ?? $property->deposit_amount ?? 0;
        $validated['approval_status'] = PropertyStatus::PENDING->value;
        $validated['airport_pickup_enabled'] = $validated['airport_pickup_enabled'] ?? false;
        $validated['guided_tours_enabled'] = $validated['guided_tours_enabled'] ?? false;
        $validated['duplicate_flag_reason'] = $this->duplicateDetector->detect(
            $validated['title'],
            $validated['location'],
            $property->user_id,
            $request->hasFile('images') ? $request->file('images') : [],
            $property->id
        );

        $property->update($validated);
        
        return redirect()->route('host.properties.index')
            ->with('success', __('host.property.updated_success'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        // Ensure host can only delete their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }
        
        if ($property->image) {
            Storage::disk('public')->delete($property->image);
        }
        if ($property->images && is_array($property->images)) {
            foreach ($property->images as $path) {
                Storage::disk('public')->delete($path);
            }
        }
        $property->delete();
        
        return redirect()->route('host.properties.index')
            ->with('success', __('host.property.deleted_success'));
    }
}
