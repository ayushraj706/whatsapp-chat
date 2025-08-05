import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST handler to create or get a chat with a phone number
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
    const { phoneNumber, customName } = await request.json();

    if (!phoneNumber) {
      return new NextResponse('Missing phoneNumber parameter', { status: 400 });
    }

    // Clean and validate phone number - match WhatsApp format (without + prefix)
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, ''); // Remove all non-digits including +
    
    // Validate phone number format (10-15 digits without + prefix to match WhatsApp webhook format)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(cleanPhoneNumber)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid phone number format', 
          message: 'Phone number must contain 10-15 digits (e.g., 918097296453)' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if trying to chat with own number (handle both formats)
    const userIdWithoutPlus = user.id.replace(/^\+/, ''); // Remove + prefix if present
    if (cleanPhoneNumber === user.id || cleanPhoneNumber === userIdWithoutPlus) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Cannot create chat with yourself' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate custom name length
    if (customName && customName.length > 100) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Custom name too long', 
          message: 'Custom name must be 100 characters or less' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating/getting chat with ${cleanPhoneNumber}, custom name: "${customName}"`);

    // Call the database function to create or get user
    const { data, error } = await supabase.rpc('create_or_get_user', {
      phone_number: cleanPhoneNumber,
      user_name: customName || null
    });

    if (error) {
      console.error('Error creating/getting user:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create chat', details: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create or retrieve user' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userData = data[0];
    console.log(`Successfully ${userData.is_new ? 'created' : 'retrieved'} user:`, userData);

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.display_name,
        custom_name: userData.custom_name,
        whatsapp_name: userData.whatsapp_name,
        last_active: userData.last_active,
        unread_count: 0, // New chats have no unread messages
        last_message: '',
        last_message_time: userData.last_active,
        last_message_type: 'text',
        last_message_sender: ''
      },
      isNew: userData.is_new,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in create-chat API:', error);
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
    status: 'Create Chat API',
    timestamp: new Date().toISOString()
  });
} 