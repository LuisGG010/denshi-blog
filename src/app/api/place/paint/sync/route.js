// src/app/api/place/sync/route.js
export async function GET(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    const userHash = crypto.createHash('sha256').update(ip).digest('hex');

    const { data } = await supabase
      .from('pixel_painters')
      .select('pixel_balance, last_painted_at')
      .eq('user_hash', userHash)
      .single();

    // Calculamos el tiempo de la próxima recarga (last_painted + 30s)
    const nextRefill = data 
      ? new Date(new Date(data.last_painted_at).getTime() + 30000).toISOString()
      : null;

    return NextResponse.json({ 
      ammo: data ? data.pixel_balance : 3,
      userHash,
      nextRefill 
    });
  } catch (err) {
    return NextResponse.json({ ammo: 3, nextRefill: null });
  }
}