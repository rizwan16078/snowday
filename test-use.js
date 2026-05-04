const React = require('react');
try {
  React.use(null);
} catch (e) {
  console.log("ERROR:", e.message);
}
