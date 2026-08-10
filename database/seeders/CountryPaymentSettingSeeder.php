<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CountryPaymentSetting;

class CountryPaymentSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Kenya – only Delivery – M-Pesa enabled
        CountryPaymentSetting::updateOrCreate(
            ['country_code' => 'KE'],
            ['enable_cod' => false, 'enable_mpesa_delivery' => true]
        );

        // Tanzania – both enabled
        CountryPaymentSetting::updateOrCreate(
            ['country_code' => 'TZ'],
            ['enable_cod' => true, 'enable_mpesa_delivery' => true]
        );

        // Add more countries as needed...
    }
}