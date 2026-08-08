<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DuplicateListingDetector
{
    /**
     * Check a candidate listing against existing properties for signs of duplication/fraud.
     * Returns a human-readable reason if flagged, or null if nothing suspicious was found.
     *
     * @param  UploadedFile[]  $uploadedImages
     */
    public function detect(string $title, string $location, int $hostUserId, array $uploadedImages = [], ?int $excludePropertyId = null): ?string
    {
        if ($reason = $this->detectTitleLocationReuse($title, $location, $hostUserId, $excludePropertyId)) {
            return $reason;
        }

        if ($uploadedImages !== [] && ($reason = $this->detectImageReuse($uploadedImages, $hostUserId, $excludePropertyId))) {
            return $reason;
        }

        return null;
    }

    private function detectTitleLocationReuse(string $title, string $location, int $hostUserId, ?int $excludePropertyId): ?string
    {
        $normalizedTitle = mb_strtolower(trim($title));
        $normalizedLocation = mb_strtolower(trim($location));

        $match = Property::where('user_id', '!=', $hostUserId)
            ->when($excludePropertyId, fn ($q) => $q->where('id', '!=', $excludePropertyId))
            ->get()
            ->first(function (Property $property) use ($normalizedTitle, $normalizedLocation) {
                return mb_strtolower(trim($property->title)) === $normalizedTitle
                    && mb_strtolower(trim($property->location)) === $normalizedLocation;
            });

        if ($match) {
            return "Same title and location as listing #{$match->id} (\"{$match->title}\") by a different host.";
        }

        return null;
    }

    /**
     * @param  UploadedFile[]  $uploadedImages
     */
    private function detectImageReuse(array $uploadedImages, int $hostUserId, ?int $excludePropertyId): ?string
    {
        $uploadedHashes = array_map(fn (UploadedFile $file) => hash_file('sha256', $file->getRealPath()), $uploadedImages);

        $others = Property::where('user_id', '!=', $hostUserId)
            ->whereNotNull('images')
            ->when($excludePropertyId, fn ($q) => $q->where('id', '!=', $excludePropertyId))
            ->get();

        foreach ($others as $property) {
            $paths = is_array($property->images) ? $property->images : [];

            foreach ($paths as $path) {
                if (! Storage::disk('public')->exists($path)) {
                    continue;
                }

                $existingHash = hash('sha256', Storage::disk('public')->get($path));

                if (in_array($existingHash, $uploadedHashes, true)) {
                    return "One or more photos match a photo already used on listing #{$property->id} (\"{$property->title}\") by a different host.";
                }
            }
        }

        return null;
    }
}
