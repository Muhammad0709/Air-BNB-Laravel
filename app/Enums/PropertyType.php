<?php

namespace App\Enums;

enum PropertyType: string
{
    case APARTMENT = 'apartment';
    case HOUSE = 'house';
    case VILLA = 'villa';
    case STUDIO = 'studio';
    case CONDO = 'condo';
}
