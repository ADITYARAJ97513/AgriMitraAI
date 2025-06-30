
'use client';

import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function PostCard({ post, onAddAnswer, onUpvoteAnswer }) {
  const { user } = useAuth();
  const [answerText, setAnswerText] = useState('');

  const onAnswerSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    onAddAnswer(post.id, answerText);
    setAnswerText('');
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div>
          <CardTitle className="text-lg">{post.question}</CardTitle>
          <CardDescription>
            Asked by <span className="font-semibold text-primary">{post.author}</span> • {post.timestamp}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.answers.map((answer, index) => (
          <div key={answer.id} className={`flex gap-4 ${index > 0 ? 'border-t pt-4' : ''}`}>
            <div className="flex-1">
              <p className="text-muted-foreground whitespace-pre-wrap">{answer.answer}</p>
              <div className="flex justify-between items-center mt-2 text-sm">
                <p className="text-muted-foreground">
                  Answer by <span className="font-semibold text-primary">{answer.author}</span> • {answer.timestamp}
                </p>
                <Button variant="ghost" size="sm" onClick={() => onUpvoteAnswer(post.id, answer.id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <ThumbsUp className="h-4 w-4" /> {answer.upvotes}
                </Button>
              </div>
            </div>
          </div>
        ))}
         {post.answers.length === 0 && (
            <p className="text-muted-foreground text-sm">No answers yet. Be the first to help!</p>
        )}
      </CardContent>
      {user && (
        <CardFooter>
          <form onSubmit={onAnswerSubmit} className="w-full flex items-start gap-4">
            <div className="flex-1 space-y-2">
                <Textarea
                placeholder="Write your answer..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="flex-1"
                required
                />
                <Button type="submit" size="sm">Post Answer</Button>
            </div>
          </form>
        </CardFooter>
      )}
    </Card>
  );
};
