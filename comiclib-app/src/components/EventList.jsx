import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';

const EventList = ({ query }) => {

  const [items, setItems] = useState([]);
  const [agentResponse, setAgentResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setItems([]);
      setAgentResponse(null);

      try {

        if (query) {
          // --- Search Mode (Using comiclib-api) ---
          const response = await fetch(`/api/searchInfo?query=${encodeURIComponent(query)}`);

          if (!response.ok) {
            throw new Error(`Search Failed: ${response.status}`);
          }

          const data = await response.json();
          // data format: { text: "...", agent_role: "...", sources: [ { title, url, type } ] }

          setAgentResponse(data.text);
          setItems(data.sources || []);

        } else {
          // --- Default News Mode (Using Comprehensive Search) ---
          // TODO: user_id should be dynamic, but hardcoded for now as requested/context implies 'juyunyoung'
          const response = await fetch('/api/search/comprehensive?user_id=juyunyoung');

          if (!response.ok) {
            throw new Error(`News Fetch Failed: ${response.status}`);
          }

          const data = await response.json();
          // data format: { items: [ { category, title, link, content, date } ] }
          setItems(data.items || []);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (loading) {
    return (
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          {query ? 'Asking the Comic Expert...' : 'Finding latest 2D news...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">Failed to load info: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>

      {/* Show Agent Text Response if available (Search Mode) */}
      {agentResponse && (
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {agentResponse}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Show List of Items (News or Citations) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.length > 0 ? items.map((item, index) => {
          // Differentiate between News Item (from Comprehensive Search) and Source Item (Search Info)
          // SearchInfo: { title, url, type }
          // Comprehensive: { category, title, link, content, date }

          const isSource = Boolean(item.type);
          const isComprehensive = Boolean(item.category);

          return (
            <Card key={index} sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                {/* Category for Comprehensive Items */}
                {isComprehensive && (
                  <Typography variant="overline" display="block" color="primary" sx={{ fontWeight: 'bold' }}>
                    {item.category}
                  </Typography>
                )}

                <Typography variant="h6" component="div" sx={{ lineHeight: 1.3, mb: 1 }}>
                  {item.title}
                </Typography>

                {!isSource && (
                  <>
                    {item.date && (
                      <Typography sx={{ mb: 1, fontSize: '0.875rem' }} color="text.secondary">
                        {item.date}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {item.content || item.description}
                    </Typography>
                  </>
                )}

                {isSource && (
                  <Typography variant="caption" display="block" sx={{ mb: 1, color: 'primary.main' }}>
                    [{item.type === 'youtube' ? 'YouTube' : 'Web Source'}]
                  </Typography>
                )}

                {(item.link || item.url) && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={item.link || item.url}
                    target="_blank"
                  >
                    {isSource ? 'Visit Source' : 'Read More'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <Typography>
            {query ? 'No additional sources found.' : 'No news found for your friends.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EventList;
