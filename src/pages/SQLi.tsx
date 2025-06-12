import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Search, Edit, Save, X } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
  };
}

function SQLi() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [user, setUser] = useState<any>(null);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to comment');

      // WARNING: This is intentionally vulnerable to XSS
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
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

  // Vulnerable comment editing - allows editing any comment
  const updateComment = async (commentId: string, newContent: string) => {
    try {
      // WARNING: This is intentionally vulnerable - no authorization check
      const { error } = await supabase
        .from('comments')
        .update({ content: newContent })
        .eq('id', commentId);

      if (error) throw error;
      
      setEditingComment(null);
      setEditContent('');
      fetchComments();
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
          user_id,
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

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
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
          <AlertTriangle className="w-8 h-8 text-indigo-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">SQL Injection & Comment System</h2>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700 font-medium">
              This page contains multiple intentional vulnerabilities: SQL Injection, XSS, and Authorization bypass.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Search section - vulnerable to SQL injection */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Search Comments (SQL Injection)</h3>
          <p className="text-gray-600 mb-4">
            This search function is vulnerable to SQL injection. Try payloads like: <code className="bg-gray-200 px-2 py-1 rounded">'; DROP TABLE comments; --</code>
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search comments... (Try SQL injection)"
            />
            <button
              onClick={() => searchComments(searchTerm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Add comment section - vulnerable to XSS */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Comment (XSS Vulnerable)</h3>
          
          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">Please <a href="/auth" className="text-indigo-600 hover:underline">login</a> to post comments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Enter your comment (HTML/JS will be executed)..."
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                Post Comment
              </button>
            </div>
          )}
        </div>

        {/* Comments list - vulnerable to stored XSS and unauthorized editing */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Comments ({comments.length})</h3>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments found. Try searching or add a new comment.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-indigo-600">
                        {comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: {comment.id.substring(0, 8)}...
                      </span>
                    </div>
                    
                    {/* Edit button - vulnerable: allows editing any comment */}
                    {user && editingComment !== comment.id && (
                      <button
                        onClick={() => startEditing(comment)}
                        className="text-blue-500 hover:text-blue-700 p-1 flex items-center gap-1"
                        title="Edit comment (No authorization check!)"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Edit</span>
                      </button>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(comment.id, editContent)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VULNERABILITY: Direct HTML rendering without sanitization */
                    <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educational Information */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Vulnerabilities in this Page</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">SQL Injection Payloads:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><code className="bg-gray-200 px-1 rounded">' OR '1'='1</code></li>
                <li><code className="bg-gray-200 px-1 rounded">' UNION SELECT * FROM users--</code></li>
                <li><code className="bg-gray-200 px-1 rounded">'; DROP TABLE comments; --</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">XSS Payloads:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><code className="bg-gray-200 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
                <li><code className="bg-gray-200 px-1 rounded">&lt;img src=x onerror=alert('XSS')&gt;</code></li>
                <li><code className="bg-gray-200 px-1 rounded">&lt;svg onload=alert('XSS')&gt;</code></li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-orange-100 rounded">
            <p className="text-orange-800 font-medium">Authorization Bypass:</p>
            <p className="text-orange-700 text-sm">Any logged-in user can edit any comment due to missing authorization checks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SQLi;