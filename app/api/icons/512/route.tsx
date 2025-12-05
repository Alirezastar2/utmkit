import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Route segment config
export const runtime = 'edge'

// Image generation
export async function GET(request: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 320,
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '64px',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        U
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}



