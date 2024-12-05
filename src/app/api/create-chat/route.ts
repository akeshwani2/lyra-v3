import { db } from "@/app/lib/db"
import { chats } from "@/app/lib/db/schema"
import { getS3Url } from "@/app/lib/s3"
import { loadS3intoPinecone } from "@/app/lib/pinecone"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server";


// export async function POST(req: Request, res: Response) {
//     const { userId } = await auth();
//     if (!userId) {
//         return NextResponse.json({error: 'Unauthorized'}, {status: 401})
//     }
//     try {
//         const body = await req.json()
//         // We take the two values from the body and destructure them, and then send them to the backend for Pinecone to index
//         const {file_key, file_name} = body
//         console.log(file_key, file_name)
//         await loadS3intoPinecone(file_key)
//         const chat_id = await db
//         .insert(chats)
//         .values({
//             fileKey: file_key,
//             pdfName: file_name,
//             pdfUrl: getS3Url(file_key),
//             userId,

//         }).returning(
//             {
//                 insertedId: chats.id
//             }
//         )
//         // This is how we get the chat_id from drizzle
//         return NextResponse.json({chat_id: chat_id[0].insertedId}, {status: 200})
//     } catch (error) {
//         console.error('Error creating chat:', error)
//         return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
//     }
// }

// import { db } from "@/lib/db";
// import { chats } from "@/lib/db/schema";
// import { loadS3IntoPinecone } from "@/lib/pinecone";
// import { getS3Url } from "@/lib/s3";
// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    await loadS3intoPinecone(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}