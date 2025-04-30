// app/mandrill-email-content/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getMandrillContent } from "@/lib/api";
import he from 'he';

export default function EmailContentPage() {
  const { id } = useParams(); // Get the id from the URL
  const [emailContent, setEmailContent] = useState<{
    content: string;
    subject: string;
    from_email: string;
    from_name: string;
    to: { email: string; name: string; type: string }[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMandrillContent(id as string);
        const data = response.data;
        setEmailContent({
          content: he.decode(data.content),
          subject: data.subject,
          from_email: data.from_email,
          from_name: data.from_name,
          to: data.to,
        });
      } catch (error: any) {
        console.error("Error fetching email content:", error);
        if (error.response?.status === 404) {
          setError("Message not found");
        } else if (error.response?.status === 401) {
          setError("Unauthorized");
          // Redirect to login page
          window.location.href = '/';
        } else {
          setError("Failed to fetch email content");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmailContent();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  if (!emailContent) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No content available</div>;
  }

  return (
    <div style={{ padding: '20px', background: 'white', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '20px' }}>Email Content</h3>
      <p style={{ marginBottom: '10px' }}><strong>Subject:</strong> {emailContent.subject}</p>
      <p style={{ marginBottom: '10px' }}><strong>From:</strong> {emailContent.from_name ? `${emailContent.from_name} <${emailContent.from_email}>` : emailContent.from_email}</p>
      <p style={{ marginBottom: '10px' }}><strong>To:</strong> {emailContent.to.map(recipient => recipient.email).join(', ')}</p>
      <hr style={{ margin: '20px 0' }} />
      <div
        dangerouslySetInnerHTML={{ __html: emailContent.content }}
        style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', overflow: 'auto' }}
      />
    </div>
  );
}