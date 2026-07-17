import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { fireToast } from './useAdminData';

const STORAGE_KEY = 'olevelsarathi_blogs';
const RTDB_TIMEOUT_MS = 10000;

const withTimeout = (promise, ms, errorMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
};

const loadLocalBlogs = () => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    const stored = JSON.parse(item);
    return Array.isArray(stored)
      ? stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];
  } catch (err) {
    console.error('Error reading local blogs:', err);
    return [];
  }
};

const saveLocalBlogs = (blogs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (err) {
    console.error('Error saving local blogs:', err);
  }
};

export const useBlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLocal, setUseLocal] = useState(false);

  const switchToLocalMode = (err) => {
    console.error('Realtime Database unavailable, falling back to local storage:', err);
    setError(err?.message || 'Realtime Database unavailable, using local storage fallback.');
    setUseLocal(true);
    setBlogs(loadLocalBlogs());
    setLoading(false);
  };

  const fetchBlogs = () => {
    setLoading(true);
    try {
      if (useLocal) {
        setBlogs(loadLocalBlogs());
        setError(null);
        setLoading(false);
        return;
      }

      const blogsRef = ref(db, 'blogs');
      onValue(blogsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const blogArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBlogs(blogArray);
        } else {
          setBlogs([]);
        }
        setError(null);
        setLoading(false);
      }, (err) => {
        if (!useLocal) {
          switchToLocalMode(err);
        }
      });
    } catch (err) {
      if (!useLocal) {
        switchToLocalMode(err);
      }
    }
  };

  const addBlog = async (blogData) => {
    setLoading(true);
    try {
      if (useLocal) {
        const localBlogs = loadLocalBlogs();
        const newBlog = {
          id: `local-${Date.now()}`,
          ...blogData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updatedBlogs = [newBlog, ...localBlogs];
        setBlogs(updatedBlogs);
        saveLocalBlogs(updatedBlogs);
        setError(null);
        setLoading(false);
        fireToast({ type: 'success', text: '✅ Blog locally save ho gaya!' });
        return newBlog.id;
      }

      fireToast({ type: 'loading', text: '⏳ Blog upload ho raha hai...' });
      const blogsRef = ref(db, 'blogs');
      const newBlogRef = push(blogsRef);
      await withTimeout(
        set(newBlogRef, {
          ...blogData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
        RTDB_TIMEOUT_MS,
        'Realtime Database write timed out'
      );
      setError(null);
      setLoading(false);
      fireToast({ type: 'success', text: '✅ Blog successfully upload ho gaya!' });
      return newBlogRef.key;
    } catch (err) {
      if (!useLocal) {
        switchToLocalMode(err);
        return addBlog(blogData);
      }
      console.error('Error adding blog:', err);
      setError(err.message);
      setLoading(false);
      fireToast({ type: 'error', text: '❌ Blog upload failed: ' + err.message });
      return null;
    }
  };

  const updateBlog = async (blogId, blogData) => {
    setLoading(true);
    try {
      if (useLocal) {
        const localBlogs = loadLocalBlogs();
        const updatedBlogs = localBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, ...blogData, updatedAt: new Date().toISOString() } : blog
        );
        setBlogs(updatedBlogs);
        saveLocalBlogs(updatedBlogs);
        setError(null);
        setLoading(false);
        fireToast({ type: 'success', text: '✅ Blog update ho gaya!' });
        return true;
      }

      fireToast({ type: 'loading', text: '⏳ Blog save ho raha hai...' });
      const blogRef = ref(db, `blogs/${blogId}`);
      await withTimeout(
        update(blogRef, {
          ...blogData,
          updatedAt: new Date().toISOString()
        }),
        RTDB_TIMEOUT_MS,
        'Realtime Database update timed out'
      );
      setError(null);
      setLoading(false);
      fireToast({ type: 'success', text: '✅ Blog successfully update ho gaya!' });
      return true;
    } catch (err) {
      if (!useLocal) {
        switchToLocalMode(err);
        return updateBlog(blogId, blogData);
      }
      console.error('Error updating blog:', err);
      setError(err.message);
      setLoading(false);
      fireToast({ type: 'error', text: '❌ Blog update failed: ' + err.message });
      return false;
    }
  };

  const deleteBlog = async (blogId) => {
    setLoading(true);
    try {
      if (useLocal) {
        const localBlogs = loadLocalBlogs();
        const updatedBlogs = localBlogs.filter((blog) => blog.id !== blogId);
        setBlogs(updatedBlogs);
        saveLocalBlogs(updatedBlogs);
        setError(null);
        setLoading(false);
        fireToast({ type: 'success', text: '✅ Blog delete ho gaya!' });
        return true;
      }

      fireToast({ type: 'loading', text: '⏳ Blog delete ho raha hai...' });
      const blogRef = ref(db, `blogs/${blogId}`);
      await withTimeout(
        remove(blogRef),
        RTDB_TIMEOUT_MS,
        'Realtime Database delete timed out'
      );
      setError(null);
      setLoading(false);
      fireToast({ type: 'success', text: '✅ Blog successfully delete ho gaya!' });
      return true;
    } catch (err) {
      if (!useLocal) {
        switchToLocalMode(err);
        return deleteBlog(blogId);
      }
      console.error('Error deleting blog:', err);
      setError(err.message);
      setLoading(false);
      fireToast({ type: 'error', text: '❌ Blog delete failed: ' + err.message });
      return false;
    }
  };

  const getBlog = async (blogId) => {
    try {
      const blog = blogs.find((b) => b.id === blogId);
      return blog || null;
    } catch (err) {
      console.error('Error getting blog:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    error,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    getBlog,
    useLocal
  };
};
