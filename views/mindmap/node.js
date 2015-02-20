var React = require('react/addons')
  , cx = React.addons.classSet
  , PT = React.PropTypes

  , Listener = require('../../listener')

var MindmapNode = React.createClass({
  mixins: [
    Listener({
      storeAttrs: function (getters, props) {
        return {
          node: getters.getNode(props.id),
          isActiveView: getters.isActiveView(),
          isActive: getters.isActive(props.id),
          isSelected: getters.isSelected(props.id),
          editState: getters.editState(props.id),
        }
      },

      initStoreState: function (state, getters, props) {
        var node = state.node
        return {
          lazyChildren: !props.isRoot && node.collapsed && node.children.length,
          collapsed: node.collapsed,
        }
      },

      updateStoreState: function (state, getters, props) {
        var node = state.node
        return {
          lazyChildren: this.state.lazyChildren && node.collapsed,
          collapsed: node.collapsed,
        }
      },

      shouldGetNew: function (nextProps) {
        return nextProps.id !== this.props.id || nextProps.store !== this.props.store
      },

      getListeners: function (props, events) {
        return [events.nodeChanged(props.id), events.nodeViewChanged(props.id)]
      },
    })
  ],

  getInitialState: function () {
    return {ticked: false}
  },

  componentDidMount: function () {
    this.props.onHeight(this.props.id, this.getDOMNode().getBoundingClientRect().height)
    this.setState({ticked: true})
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.props.onHeight(this.props.id, this.getDOMNode().getBoundingClientRect().height)
    if (this.state.collapsed !== prevState.collapsed) {
      this.props.reCalc()
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return nextProps.id !== this.props.id || nextState !== this.state || nextProps.positions !== this.props.positions
  },

  _onClick: function () {
    if (this.state.node.children && this.state.node.children.length) {
      this.props.store.actions.toggleCollapse(this.props.id)
      // this.props.reCalc()
    }
  },

  render: function () {
    var box
    if (this.state.ticked) {
      box = this.props.positions[this.props.id]
    } 
    if (!box) {
      box = {x: this.props.px, y: this.props.py}
    }
    var style = {
      transform: 'translate(' + (box.x - this.props.px) + 'px, ' + (box.y - this.props.py) + 'px)',
      opacity: (this.props.hiding || !this.state.ticked) ? 0 : 1,
    }
    var cls = cx({
      'MindmapNode': true,
      'MindmapNode-hiding': this.props.hiding,
      'MindmapNode-active': this.state.isActive,
      'MindmapNode-collapsed': this.state.node.collapsed,
    })
    return <div style={style} className={cls}>
      <div onClick={this._onClick} className='MindmapNode_main'>
        {this.state.node.content}
      </div>
      {this.state.node.children.length ? <div className='MindmapNode_children'>
        {!this.state.lazyChildren && this.state.node.children.map((id, i) =>
          <MindmapNode
            px={box.x}
            py={box.y}
            hiding={this.props.hiding || this.state.node.collapsed}
            onHeight={this.props.onHeight}
            reCalc={this.props.reCalc}
            positions={this.props.positions}
            plugins={this.props.plugins}
            store={this.props.store}
            bodies={this.props.bodies}
            index={i}
            key={id}
            id={id} />
        )}
      </div> : null}
    </div>
  },
})

module.exports = MindmapNode