import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST handler to update user custom name
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse request body
    const { userId, customName } = await request.json();

    if (!userId) {
      return new NextResponse('Missing userId parameter', { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(userId)) {
      return new NextResponse('Invalid phone number format', { status: 400 });
    }

    // Validate custom name length
    if (customName && customName.length > 100) {
      return new NextResponse('Custom name too long (max 100 characters)', { status: 400 });
    }

    console.log(`Updating custom name for user ${userId}: "${customName}"`);

    // Call the database function to update custom name
    const { data, error } = await supabase.rpc('update_user_custom_name', {
      user_id: userId,
      new_custom_name: customName || null
    });

    if (error) {
      console.error('Error updating user custom name:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update user name', details: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated custom name for user ${userId}`);

    return NextResponse.json({
      success: true,
      userId,
      customName: customName || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in update-name API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET handler for checking API status
 */
export async function GET() {
  return NextResponse.json({
    status: 'Update User Name API',
    timestamp: new Date().toISOString()
  });
} 