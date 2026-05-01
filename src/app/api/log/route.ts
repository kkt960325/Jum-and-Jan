import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { level, args } = data;
    const logMessage = `[Client ${level.toUpperCase()}] ${args.join(' ')}`;
    
    // Print to user's terminal
    if (level === 'error') {
      console.error('\x1b[31m%s\x1b[0m', logMessage);
    } else if (level === 'warn') {
      console.warn('\x1b[33m%s\x1b[0m', logMessage);
    } else {
      console.log('\x1b[36m%s\x1b[0m', logMessage);
    }
    
    // Write to a file so I (AntiGravity) can read it
    const logFilePath = path.join(process.cwd(), '.client_logs.txt');
    fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] ${logMessage}\n`);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
