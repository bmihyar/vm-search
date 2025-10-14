# Typesense Search App

A modern, responsive search interface built with Next.js and Typesense, featuring expandable search results and clean UI design.

## ✨ Features

- **Clean Search Interface**: Minimal design focused on search functionality
- **Expandable Results**: Title-only display with expandable content previews
- **Advanced Search**: Enhanced search page with filters and sorting options
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Search**: Instant search results as you type
- **Highlighted Results**: Search terms are highlighted in results

## 🎯 UI Design

### Main Search Page (`/`)

- **Clean Layout**: No health checks or schema information cluttering the interface
- **Title-First Display**: Search results show only titles initially
- **Expandable Content**: Click any title to reveal:
  - Content preview (first 150 characters)
  - Metadata badges (type, status)
  - Publication date
  - "Read Full Article" link
- **Visual Feedback**: Smooth animations for expand/collapse actions

### Enhanced Search Page (`/enhanced`)

- **Sidebar Filters**: Filter by date and other faceted fields
- **Sorting Options**: Sort by relevance, date, or title
- **Advanced Features**: Pagination, refinements, and search statistics
- **Same Expandable UI**: Consistent expandable title design

## 🛠 Setup

### 1. Environment Variables

Create a `.env.local` file in the Typesense app directory:

```env
NEXT_PUBLIC_TYPESENSE_HOST=localhost
NEXT_PUBLIC_TYPESENSE_PORT=8108
NEXT_PUBLIC_TYPESENSE_PROTOCOL=http
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=xyz
NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000
```

### 2. Start Typesense Server

```bash
docker run -d \
  --name typesense \
  -p 8108:8108 \
  -e TYPESENSE_API_KEY=xyz \
  -e TYPESENSE_DATA_DIR=/data \
  -v typesense_data:/data \
  typesense/typesense:29.0 \
  --data-dir /data --api-key=xyz --enable-cors
```

### 3. Run the App

From the project root:

```bash
# Install dependencies
npm install

# Start the Typesense app on port 3002
npm run dev --workspace=typesense
```

Or from the app directory:

```bash
cd apps/typesense
npm run dev
```

## 🎨 UI Components

### Search Results

Each search result consists of:

- **Title**: Always visible, clickable to expand/collapse
- **Expand Icon**: Visual indicator for expandable content
- **Content Preview**: Shown when expanded (150 chars with ellipsis)
- **Metadata Badges**: Type and status with color coding
- **Date**: Formatted publication date
- **Read More Link**: Direct link to full article with external icon

### Styling

- **Modern Design**: Clean cards with subtle shadows and hover effects
- **Smooth Animations**: CSS transitions for expand/collapse actions
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Proper focus states and keyboard navigation
- **Brand Colors**: Blue accent colors for links and primary actions

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Metadata stacks vertically on smaller screens
- **Touch-Friendly**: Large click targets for mobile interaction
- **Readable Typography**: Appropriate font sizes for all devices

## 🔧 Customization

### Modify Search Behavior

Edit `src/config/typesense.ts` to change:
- Search fields (`query_by`)
- Connection settings
- Search parameters

### Update UI Styling

Modify `src/app/globals.css` for:
- Color schemes
- Spacing and layout
- Animation timings
- Custom component styles

### Change Content Preview Length

In the `Hit` component, modify the `getContentPreview` function:

```javascript
const getContentPreview = (content: string) => {
  // Change 150 to your preferred length
  return plainText.length > 150 
    ? plainText.substring(0, 150) + "..."
    : plainText;
};
```

## 🚀 Performance

- **Lazy Loading**: Content is only rendered when expanded
- **Optimized Animations**: CSS transforms for smooth performance
- **Efficient Re-renders**: React state management prevents unnecessary updates
- **Cached Searches**: Typesense InstantSearch handles query caching

## 📊 Analytics & SEO

The search interface is optimized for:
- **Search Analytics**: Track search queries and result interactions
- **SEO-Friendly URLs**: Direct links to full articles
- **Fast Loading**: Minimal initial content load
- **User Experience**: Clear visual hierarchy and intuitive interactions

## 🔍 Search Features

### Basic Search
- Search across titles and content
- Real-time results as you type
- Highlighted search terms
- Responsive result count

### Enhanced Search
- Faceted search by date
- Multiple sorting options
- Pagination for large result sets
- Current refinements display
- Clear all filters option

## 🎯 Best Practices

1. **Keep Titles Descriptive**: Titles are the primary navigation element
2. **Optimize Content Previews**: Ensure first 150 characters are meaningful
3. **Use Meaningful Slugs**: Article URLs should be descriptive
4. **Maintain Consistent Metadata**: Type and status fields help users filter content
5. **Test on Mobile**: Ensure touch interactions work smoothly

## 📖 API Integration

### Environment Variables

- `NEXT_PUBLIC_TYPESENSE_HOST`: Typesense server hostname
- `NEXT_PUBLIC_TYPESENSE_PORT`: Typesense server port (default: 8108)
- `NEXT_PUBLIC_TYPESENSE_PROTOCOL`: Connection protocol (http/https)
- `NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY`: Search-only API key for security
- `NEXT_PUBLIC_WEB_APP_URL`: Base URL for the main web app where articles are hosted (default: http://localhost:3000)

### Article Links

The "Read Full Article" links will point to `${NEXT_PUBLIC_WEB_APP_URL}/${slug}`. Make sure your main web app has routes that match the slugs in your search data.

## 📄 Data Schema

The search interface expects your Typesense collection to have:

```javascript
{
  ID: 'int32',        // Unique identifier
  date: 'string',     // Publication date (YYYY-MM-DD format)
  slug: 'string',     // URL slug for the article
  type: 'string',     // Content type (article, tutorial, etc.)
  title: 'string',    // Article title (searchable)
  status: 'string',   // Publication status (published, draft)
  content: 'string'   // Article content (searchable)
}
```

For optimal search performance, ensure titles and content are properly indexed and content previews are meaningful.