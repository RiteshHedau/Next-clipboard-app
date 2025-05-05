import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';
import mongoose from "mongoose";

connect()

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token || !token.value) {
            return NextResponse.json({
                success: false,
                error: "No authentication token found"
            }, { status: 401 });
        }

        // Verify token and get user ID
        const decodedToken: any = jwt.verify(token.value, process.env.TOKEN_SECRET!);
        if (!decodedToken?.id) {
            return NextResponse.json({
                success: false,
                error: "Invalid token format"
            }, { status: 401 });
        }

        // Find user and get pastes
        const user = await User.findById(decodedToken.id)
        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 404 });
        }

        console.log(user);

        return NextResponse.json({
            success: true,
            data: {
                pastes: user.pastes
            }
        });

    } catch (error: any) {
        console.error('Error in GET /api/users/pastes:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({
                success: false,
                error: "Invalid token"
            }, { status: 401 });
        }
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token || !token.value) {
            return NextResponse.json({
                success: false,
                error: "No authentication token found"
            }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token.value, process.env.TOKEN_SECRET!);
        if (!decodedToken?.id) {
            return NextResponse.json({
                success: false,
                error: "Invalid token format"
            }, { status: 401 });
        }

        const reqBody = await request.json();
        console.log('Received paste:', reqBody);

        if (!reqBody.content) {
            return NextResponse.json({
                success: false,
                error: "Paste content is required"
            }, { status: 400 });
        }

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 404 });
        }

        // Initialize pastes array if it doesn't exist
        if (!user.pastes) {
            user.pastes = [];
        }

        // Create new paste with correct structure
        const newPaste = {
            pasteId: new mongoose.Types.ObjectId().toString(),
            content: reqBody.content,
            createdAt: new Date()
        };

        // Add paste and save
        user.pastes.push(newPaste);
        console.log('Saving paste:', newPaste);
        console.log('User pastes before save:', user.pastes);

        const savedUser = await user.save();
        console.log('User pastes after save:', savedUser.pastes);

        return NextResponse.json({
            success: true,
            data: {
                paste: newPaste,
                allPastes: savedUser.pastes
            }
        });

    } catch (error: any) {
        console.error('Error in POST /api/users/pastes:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({
                success: false,
                error: "Invalid token"
            }, { status: 401 });
        }
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token || !token.value) {
            return NextResponse.json({
                success: false,
                error: "No authentication token found"
            }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token.value, process.env.TOKEN_SECRET!);
        const pasteId = request.nextUrl.searchParams.get('pasteId');
        console.log('Delete request pasteId:', pasteId); // Debug log

        if (!pasteId) {
            return NextResponse.json({
                success: false,
                error: "PasteId is required"
            }, { status: 400 });
        }

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 404 });
        }

        // Find and remove the paste
        const pasteIndex = user.pastes.findIndex((p: any) => p.pasteId === pasteId);
        console.log('Paste index:', pasteIndex); // Debug log
        if (pasteIndex === -1) {
            return NextResponse.json({
                success: false,
                error: "Paste not found",
                details: {
                    requestedId: pasteId,
                    totalPastes: user.pastes.length
                }
            }, { status: 404 });
        }

        const deletedPaste = user.pastes[pasteIndex];
        user.pastes.splice(pasteIndex, 1);
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Paste deleted successfully",
            data: {
                deletedPaste: {
                    pasteId: deletedPaste.pasteId,
                    content: deletedPaste.content.substring(0, 50) + (deletedPaste.content.length > 50 ? '...' : ''),
                    createdAt: deletedPaste.createdAt
                },
                remainingPastes: user.pastes.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}


export async function PUT(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token || !token.value) {
            return NextResponse.json({
                success: false,
                error: "No authentication token found"
            }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token.value, process.env.TOKEN_SECRET!);
        const pasteId = request.nextUrl.searchParams.get('pasteId');
        console.log('Update request pasteId:', pasteId); // Debug log

        if (!pasteId) {
            return NextResponse.json({
                success: false,
                error: "PasteId is required"
            }, { status: 400 });
        }

        const reqBody = await request.json();
        console.log('Received update content:', reqBody); // Debug log

        if (!reqBody.content) {
            return NextResponse.json({
                success: false,
                error: "Paste content is required"
            }, { status: 400 });
        }

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 404 });
        }

        // Find the paste to update
        const pasteIndex = user.pastes.findIndex((p: any) => p.pasteId === pasteId);
        console.log('Paste index for update:', pasteIndex); // Debug log
        if (pasteIndex === -1) {
            return NextResponse.json({
                success: false,
                error: "Paste not found",
                details: {
                    requestedId: pasteId,
                    totalPastes: user.pastes.length
                }
            }, { status: 404 });
        }

        // Update the paste content
        user.pastes[pasteIndex].content = reqBody.content;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Paste updated successfully",
            data: {
                updatedPaste: {
                    pasteId: user.pastes[pasteIndex].pasteId,
                    content: user.pastes[pasteIndex].content.substring(0, 50) + (user.pastes[pasteIndex].content.length > 50 ? '...' : ''),
                    createdAt: user.pastes[pasteIndex].createdAt
                },
                remainingPastes: user.pastes.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    } 
}