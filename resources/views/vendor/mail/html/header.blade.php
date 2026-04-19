@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<img
    src="{{ url('images/logo-main.png') }}"
    class="logo-main"
    alt="{{ config('app.name') }}"
    width="180"
    style="display: block; margin: 0 auto; max-width: 180px; height: auto; border: 0; outline: none;"
/>
</a>
</td>
</tr>
