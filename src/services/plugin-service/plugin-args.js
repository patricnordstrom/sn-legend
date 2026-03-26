/**
 * The arguments that are passed to the fn function of the plugin definition.
 * @namespace pluginArguments
 * @entry
 */

/**
 * Prepare important chart internals for the users to build their own plugins
 * @param {object} layout
 * @returns {pluginArguments} Chart internals that will be exposed to the users.
 */
function getPluginArgs(layout) {
  /**
   * @lends pluginArguments
   */
  const pluginArgs = {
    /**
     * The layout from the enigma model.
     * @type {object}
     */
    layout,
    /**
     * The keys (references) to different types of chart internals
     * @type {object}
     */
    keys: {
      /**
       * The scales associated with the legend chart.
       * @type {object}
       */
      SCALE: {
        /**
         * The scale used for coloring the legend
         * @type {string}
         */
        FILL: 'fill',
      },
      /**
       * The unique keys of the existing components available in the legend chart.
       * @type {object}
       */
      COMPONENT: {
        /**
         * The legend component
         * @type {string}
         */
        LEGEND: 'legend-cat',
      },
    },
  };

  return pluginArgs;
}

export default getPluginArgs;
