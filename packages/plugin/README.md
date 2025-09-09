# EduNiti College Plugin

An embeddable JavaScript widget that allows colleges to display their information from the EduNiti platform on their own websites.

## Features

- **Easy Integration**: Simple HTML data attributes or JavaScript initialization
- **Customizable**: Multiple themes and display options
- **Real-time Data**: Automatically syncs with EduNiti database
- **Responsive Design**: Works on all device sizes
- **No Dependencies**: Pure JavaScript with no external dependencies

## Quick Start

### Method 1: HTML Data Attributes (Recommended)

Add the following HTML to your website:

```html
<div 
  id="eduniti-college-widget"
  data-eduniti-college-id="your-college-id"
  data-eduniti-api-key="your-api-key"
  data-eduniti-theme="light"
  data-eduniti-show-programs="true"
  data-eduniti-show-facilities="true"
  data-eduniti-show-admission="true"
  data-eduniti-show-contact="true">
</div>

<script src="https://cdn.eduniti.in/plugin/v1/eduniti-college-plugin.js"></script>
```

### Method 2: JavaScript Initialization

```html
<div id="college-widget"></div>

<script src="https://cdn.eduniti.in/plugin/v1/eduniti-college-plugin.js"></script>
<script>
  const plugin = new EduNitiCollegePlugin({
    collegeId: 'your-college-id',
    apiKey: 'your-api-key',
    containerId: 'college-widget',
    theme: 'light',
    showPrograms: true,
    showFacilities: true,
    showAdmissionInfo: true,
    showContactInfo: true
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collegeId` | string | required | Your college's unique identifier |
| `apiKey` | string | required | Your API key for authentication |
| `theme` | 'light' \| 'dark' | 'light' | Visual theme for the widget |
| `showPrograms` | boolean | true | Display programs offered |
| `showFacilities` | boolean | true | Display available facilities |
| `showAdmissionInfo` | boolean | true | Display admission timeline |
| `showContactInfo` | boolean | true | Display contact information |
| `customCSS` | string | '' | Custom CSS to override default styles |
| `containerId` | string | 'eduniti-college-widget' | ID of the container element |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-eduniti-college-id` | Your college's unique identifier |
| `data-eduniti-api-key` | Your API key for authentication |
| `data-eduniti-theme` | Theme: 'light' or 'dark' |
| `data-eduniti-show-programs` | Show programs: 'true' or 'false' |
| `data-eduniti-show-facilities` | Show facilities: 'true' or 'false' |
| `data-eduniti-show-admission` | Show admission info: 'true' or 'false' |
| `data-eduniti-show-contact` | Show contact info: 'true' or 'false' |

## API Methods

### updateOptions(newOptions)
Update plugin options after initialization.

```javascript
plugin.updateOptions({
  theme: 'dark',
  showPrograms: false
});
```

### refresh()
Refresh the college data from the server.

```javascript
plugin.refresh();
```

### destroy()
Remove the plugin and clean up resources.

```javascript
plugin.destroy();
```

## Custom Styling

You can customize the appearance using CSS:

```html
<style>
  .eduniti-college-widget {
    border-radius: 20px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
  }
  
  .eduniti-header {
    background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
  }
</style>
```

## Error Handling

The plugin includes built-in error handling:

- Network errors fall back to cached data
- Invalid API keys show appropriate error messages
- Missing containers are created automatically
- Debug mode provides detailed error logging

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security

- All API requests use HTTPS
- API keys are validated server-side
- No sensitive data is stored in the browser
- Content Security Policy (CSP) compatible

## Getting Your API Key

1. Sign up for an EduNiti college account
2. Go to your dashboard
3. Navigate to "Plugin Settings"
4. Generate your API key
5. Copy the key and use it in the plugin

## Support

For technical support or questions:

- Email: support@eduniti.in
- Documentation: https://docs.eduniti.in/plugin
- GitHub Issues: https://github.com/eduniti/college-plugin/issues

## License

MIT License - see LICENSE file for details.
