
'use client';

import React, { useState } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialPosts } from '@/data/community-posts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PostCard from '@/components/community/PostCard';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newPost = {
      id: Date.now(),
      author: user?.username || 'Anonymous Farmer',
      question: newQuestion,
      timestamp: 'Just now',
      answers: [],
    };
    setPosts([newPost, ...posts]);
    setNewQuestion('');
  };

  const handleAddAnswer = (postId, answerText) => {
    const newAnswer = {
      id: Date.now(),
      author: user?.username || 'Anonymous Farmer',
      answer: answerText,
      timestamp: 'Just now',
      upvotes: 0,
    };
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, answers: [newAnswer, ...post.answers] }
        : post
    ));
  };

  const handleUpvoteAnswer = (postId, answerId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            answers: post.answers.map(answer =>
              answer.id === answerId
                ? { ...answer, upvotes: answer.upvotes + 1 }
                : answer
            )
          }
        : post
    ));
  };

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <Users className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold mt-4">Farmer Community Forum</h1>
            <p className="text-muted-foreground mt-2">Ask questions and get answers from fellow farmers and experts.</p>
        </div>

        {user ? (
            <Card className="mb-8 bg-white">
            <CardHeader>
                <CardTitle>Ask a New Question</CardTitle>
            </CardHeader>
            <form onSubmit={handleAskQuestion}>
                <CardContent className="space-y-4">
                <Textarea
                    placeholder="What's on your mind? Ask about crops, soil, pests, or anything related to farming..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    required
                />
                </CardContent>
                <CardFooter>
                <Button type="submit">Post Question</Button>
                </CardFooter>
            </form>
            </Card>
        ) : (
            <Alert className="mb-8 bg-white">
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>Join the Conversation!</AlertTitle>
                <AlertDescription>
                    <Link href="/login" className="font-bold text-primary hover:underline">Log in</Link> or <Link href="/signup" className="font-bold text-primary hover:underline">sign up</Link> to ask questions and share your knowledge with the community.
                </AlertDescription>
            </Alert>
        )}
        
        <div className="space-y-6">
            {posts.map(post => (
            <PostCard 
                key={post.id} 
                post={post} 
                onAddAnswer={handleAddAnswer} 
                onUpvoteAnswer={handleUpvoteAnswer} 
            />
            ))}
        </div>
        </div>
    </div>
  );
}
