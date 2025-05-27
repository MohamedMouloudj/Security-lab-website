import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
  };
}

function SQLi() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Vulnerable function - intentionally using raw SQL
  const searchComments = async (term: string) => {
    try {
      // WARNING: This is intentionally vulnerable to SQL injection
      const { data, error } = await supabase.rpc('search_comments', {
        search_term: term
      });
      
      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addComment = async () => {
    try {
      // WARNING: This is intentionally vulnerable to XSS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to comment');

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            user_id: user.id
          }
        ]);

      if (error) throw error;
      
      // Refresh comments
      fetchComments();
      setNewComment('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:user_id (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">SQL Injection Testing</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Search section - vulnerable to SQL injection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Comments
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="Search comments..."
            />
            <button
              onClick={() => searchComments(searchTerm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Add comment section - vulnerable to XSS */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Comment
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
            rows={3}
            placeholder="Enter your comment..."
          />
          <button
            onClick={addComment}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Post Comment
          </button>
        </div>

        {/* Comments list - vulnerable to stored XSS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comments</h3>
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-indigo-600">
                  {comment.user?.username || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SQLi;