exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /multiselect-react-dropdown/,
            use: loaders.null()
          }
        ]
      }
    })
  }
}
