﻿/**
  * @constructor 
  */

var EventHandler = function(type, is_capturing, handler_key, cancel_bubble)
{
  if (typeof cancel_bubble != 'boolean')
  {
    cancel_bubble = true;
  }
  handler_key = handler_key ? handler_key : 'handler';
  if(!window.eventHandlers)
  {
    window.eventHandlers = {};
  }
  if(window.eventHandlers[type])
  {
    return;
  }

  window.eventHandlers[type] = {broker: ActionBroker && 
                                        ActionBroker.get_instance() || 
                                        null};

  var handler = function(event)
  {
    var ele = event.target, handler = null, container = null;

    if( ele.nodeType != 1 )
    {
      return;
    }

    if (event.which == 3 && event.type in {"click": 1, "mousedown": 1, "mouseup": 1})
    {
      // right click
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    while (ele)
    {
      handler = ele.getAttribute(handler_key);
      while (!(handler && eventHandlers[type][handler]) && (ele = ele.parentNode))
      {
        handler = ele.nodeType == 1 ? ele.getAttribute(handler_key) : null;
      }
      if (handler && ele)
      {
        if (type == 'click' && /toolbar-buttons/i.test(ele.parentNode.nodeName))
        {
          container = 
            document.getElementById(ele.parentNode.parentNode.id.replace('toolbar', 'container'));
        }
        eventHandlers[type][handler](event, ele, container);
      }
      ele = cancel_bubble ? null : ele && ele.parentNode;
    }
  }

  this.post = function(handler, event)
  {
    if(eventHandlers[type][handler])
    {
      eventHandlers[type][handler](event);
    }
  }

  document.addEventListener(type, handler, is_capturing ? is_capturing : false);
}

new EventHandler('click');
new EventHandler('dblclick', false, 'edit-handler');
new EventHandler('change');
new EventHandler('input');
new EventHandler('keyup', true);
new EventHandler('keydown', true);
new EventHandler('keypress', true);
new EventHandler('mousedown');
new EventHandler('mouseup');
new EventHandler('mouseout');
new EventHandler('mouseover', null, null, false);
new EventHandler('focus', true, 'focus-handler');
new EventHandler('blur', true, 'blur-handler');
new EventHandler('mousewheel');

/***** general ui click handler *****/

eventHandlers.mousedown['tab'] = function(event, target)
{
  var tabs = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  var view_id = target.get_attr('parent-node-chain', 'ref-id');
  if( tabs )
  {
    tabs.setActiveTab(view_id);
  }
  else
  {
    opera.postError(ui_strings.S_DRAGONFLY_INFO_MESSAGE + 
      "tabs is missing in eventHandlers.click['tab'] in ui-actions");
  }
}

eventHandlers.mousewheel['change-on-scroll'] = function(event, target)
{
  if (target.nodeName == "tab")
  {
    target = target.parentNode;
  }
  var active_tab = target.querySelector(".active")
  if (event.detail < 0) {
      if (active_tab.previousElementSibling)
      {
        eventHandlers.mousedown['tab'](null, active_tab.previousElementSibling);
      }
  }
  else {
      if (active_tab.nextElementSibling)
      {
        eventHandlers.mousedown['tab'](null, active_tab.nextElementSibling);
      }
  }
}

eventHandlers.click['close-tab'] = function(event, target)
{
  //target = target.parentElement;

  var tabbar_id = target.get_attr("parent-node-chain", "tabbar-ref-id");
  var view_id = target.get_attr("parent-node-chain", "ref-id");
  var tabbar = tabbar_id && view_id && UI.get_instance().get_tabbar(tabbar_id) || null;
  if (tabbar)
  {
    tabbar.remove_tab(view_id);
  }
}

eventHandlers.mousedown['horizontal-nav'] = function(event, target)
{
  var horizontal_nav = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  var dir = target.get_attr('parent-node-chain', 'dir');
  horizontal_nav.nav(dir, true);
};

eventHandlers.mouseup['horizontal-nav'] =
eventHandlers.mouseout['horizontal-nav'] = function(event, target)
{
  var selection = window.getSelection();
  if (!selection.isCollapsed)
  {
    selection.removeAllRanges();
  }
  var horizontal_nav = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  horizontal_nav.clear_nav_timeout();
};

eventHandlers.mousewheel['breadcrumbs-drag'] = function(event, target)
{
  var horizontal_nav = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  horizontal_nav.nav(event.detail < 0 ? 100 : -100);
};

eventHandlers.mousedown['breadcrumbs-drag'] = function(event, target)
{
  var horizontal_nav = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  horizontal_nav.drag_breadcrumb(event, target);
  
};

eventHandlers.click['settings-tabs'] = function(event, target)
{
  var tabs = UIBase.getUIById(target.parentElement.getAttribute('ui-id'));
  windows.showWindow('window-3', 'Settings', templates.settings(tabs), 200, 200, 200, 200);
}

eventHandlers.click['toggle-setting'] = function(event, target)
{
  var old_setting = target.parentElement;
  var view_id = target.getAttribute('view-id');
  var view = views[view_id];
  var setting = document.render(templates.setting( view_id, view.name, !target.firstChild.hasClass('unfolded') ));
  old_setting.parentElement.replaceChild(setting, old_setting);
}

eventHandlers.click['show-search'] = function(event, target)
{
  var toolbar = UIBase.getUIById(target.get_attr('parent-node-chain', 'ui-id'));
  if (toolbar)
  {
    var search = UI.get_instance().get_search(toolbar.cell.container.view_id);
    if (search)
    {
      target.getAttribute("is-active") == "true" ? search.hide() : search.show();
    }
  }
}





eventHandlers.click['show-window'] = function(event)
{
  var target = event.target;
  var view_id = target.getAttribute('view-id');
  target.parentNode.parentNode.parentNode.removeChild(target.parentNode.parentNode);
  UIWindowBase.showWindow(view_id);
}

eventHandlers.click['top-settings'] = function(event)
{
  UIWindowBase.showWindow('settings_view');
}

eventHandlers.click['documentation'] = function(event)
{
  window.open(event.target.getAttribute('param'), '_info_window').focus();
}


eventHandlers.click['top-window-close'] = function(event)
{
  window.close();
}

eventHandlers.click['top-window-toggle-attach'] = function(event)
{
  window.opera.attached = !window.opera.attached;
  window.settings.general.set('window-attached',  window.opera.attached);
  window.client.create_window_controls();
}

eventHandlers.click['overlay-tab'] = function(event, target)
{
  Overlay.get_instance().change_group(event.target.getAttribute("group"));
};

eventHandlers.click['toggle-overlay'] = function(event, target)
{
  var overlay = Overlay.get_instance();
  var overlay_id = target.getAttribute("data-overlay-id");

  overlay.is_visible ?
      this.broker.dispatch_action("global", "hide-overlay", event, target) :
      this.broker.dispatch_action("global", "show-overlay", event, target);
};

eventHandlers.click['toggle-console'] = function(event, target)
{
  this.broker.dispatch_action("global", "toggle-console", event, target);
};

eventHandlers.click['toolbar-switch'] = function(event)
{
  var target = event.target;
  var arr = target.getAttribute('key').split('.');
  var setting = arr[0], key = arr[1];
  var is_active = !( target.getAttribute('is-active') == 'true' && true || false );
  target.setAttribute('is-active', is_active ? 'true' : 'false');

  settings[setting].set(key, is_active);
  views.settings_view.syncSetting(setting, key, is_active);
  views[setting].update();
  /*
  // if the switch view is different, e.g. 'setting' is not the actual view
  // getViewWithHandler is a bit expensive
  var view = UIBase.getViewWithHandler(target);
  view && view.update();
  */
  // hack to trigger a repaint while
  target.style.backgroundColor = "transparent";
  target.style.removeProperty('background-color');
}



/***** change handler *****/

eventHandlers.change['checkbox-setting'] = function(event)
{
  var ele = event.target;
  var view_id = ele.getAttribute('view-id');
  settings[view_id].set(ele.name, ele.checked, true);
  views[view_id].update();
  var host_view = ele.getAttribute('host-view-id');
  if( host_view )
  {
    views.settings_view.syncSetting(view_id, ele.name, ele.checked);
  }
}

eventHandlers.focus['focus'] = function(event, target)
{
  /* TODO remove, placeholder is now implemented
  var parent = event.target.parentNode;
  if( parent.nodeName.toLowerCase() == 'filter' )
  {
    parent.firstChild.textContent = '';
    parent.addClass('focus');
    if(event.target.value)
    {
      event.target.selectionStart = 0;
      event.target.selectionEnd = event.target.value.length;

    }
  }
  */
}

eventHandlers.blur['blur'] = function(event, target)
{
  /* TODO remove, placeholder is now implemented
  var parent = event.target.parentNode;
  if( parent.nodeName.toLowerCase() == 'filter' )
  {
    if( !event.target.value )
    {
      parent.firstChild.textContent = event.target.getAttribute('default-text');
      
    }
    parent.removeClass('focus');
  }
  */
}

