import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';

interface DeleteTemplateRequest {
  templateId: string;
  templateName: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if WhatsApp API is configured
    if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_ACCESS_TOKEN) {
      return new NextResponse('WhatsApp Business API not configured', { status: 500 });
    }

    // Parse request body
    const { templateId, templateName }: DeleteTemplateRequest = await request.json();

    if (!templateId || !templateName) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required fields', 
          message: 'templateId and templateName are required' 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to delete template: ${templateName} (ID: ${templateId})`);

    // Delete template from Meta Business API
    const apiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    const deleteParams = new URLSearchParams({
      name: templateName
    });

    const response = await fetch(`${apiUrl}?${deleteParams.toString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Failed to delete template from Meta API:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        templateId,
        templateName
      });

      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to delete template', 
          details: responseData,
          status: response.status,
          templateId,
          templateName
        }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Template deleted successfully: ${templateName} (ID: ${templateId})`);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      templateId,
      templateName,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in delete template API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 