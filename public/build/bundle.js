
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\component\HourTime.svelte generated by Svelte v3.29.0 */

    const file = "src\\component\\HourTime.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each hours as hour}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*hour*/ ctx[3] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*hour*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file, 9, 6, 250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:4) {#each hours as hour}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let label;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*hours*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Hour";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "for", "hours");
    			add_location(label, file, 6, 2, 128);
    			attr_dev(select, "name", "Hours");
    			attr_dev(select, "id", "hours");
    			attr_dev(select, "class", "svelte-1x5rand");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file, 7, 2, 163);
    			attr_dev(div, "class", "dropdown svelte-1x5rand");
    			add_location(div, file, 5, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hours*/ 2) {
    				each_value = /*hours*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, hours*/ 3) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HourTime", slots, []);
    	const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HourTime> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, hours);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ hours, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, hours, select_change_handler];
    }

    class HourTime extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HourTime",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<HourTime> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<HourTime>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<HourTime>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\component\MinTime.svelte generated by Svelte v3.29.0 */

    const file$1 = "src\\component\\MinTime.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (14:4) {#each mins as min}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*min*/ ctx[3] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*min*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$1, 14, 6, 310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(14:4) {#each mins as min}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*mins*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Min";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "for", "hours");
    			add_location(label, file$1, 11, 2, 191);
    			attr_dev(select, "name", "Minutes");
    			attr_dev(select, "id", "mins");
    			attr_dev(select, "class", "svelte-ink3zy");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$1, 12, 2, 225);
    			attr_dev(div, "class", "dropdown svelte-ink3zy");
    			add_location(div, file$1, 10, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mins*/ 2) {
    				each_value = /*mins*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, mins*/ 3) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const inc = 5;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MinTime", slots, []);
    	let { value } = $$props;
    	const mins = [];
    	for (let i = 0; i <= 60; i += inc) mins.push(i);
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MinTime> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, mins);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ value, mins, inc });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, mins, select_change_handler];
    }

    class MinTime extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MinTime",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<MinTime> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<MinTime>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MinTime>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const audio = new Audio('sound/beep.mp3');

    function playAlert() {
      // return audio.play();
      return new Promise(res=>{
        audio.play();
        setTimeout(()=>{audio.play();}, 500);
        setTimeout(()=>{audio.play(); }, 1000);
        setTimeout(()=>{audio.play();   res(); }, 1200 );
      });
    }

    function formatTimeStr([$nextAlert, $currentTime]) {

      let string = "";

      const total = Math.max( ( Date.parse($nextAlert) - Date.parse(new Date()) ), 0 );
      const seconds = Math.floor( (total/1000) % 60 );
      const minutes = Math.floor( (total/1000/60) % 60 );
      const hours = Math.floor( (total/(1000*60*60)) % 24 );

      const isMorethanHour = (hours) >= 1;
      const isMorethanMin = (minutes) >= 1;

      if( isMorethanHour ) string = `${hours}h`;
      if( isMorethanMin ) string += ` ${minutes}m`;
      
      string += ` ${ seconds }s`;
      return { string, total };
    }

    const message = writable("");
    const createdAt = writable(new Date());
    const nextAlert = writable(new Date());
    const currentTime = writable(new Date());
    const stop = writable(true);
    const alertBox = writable(false);
    const timeString = derived([nextAlert, currentTime], formatTimeStr);
    const interval = writable(undefined);

    /* src\component\NewAlert.svelte generated by Svelte v3.29.0 */
    const file$2 = "src\\component\\NewAlert.svelte";

    // (48:0) {#if isAddOrUpdateAlert}
    function create_if_block(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let input;
    	let selectTextOnFocus_action;
    	let t2;
    	let p;
    	let t4;
    	let div0;
    	let hourtime;
    	let updating_value;
    	let t5;
    	let mintim;
    	let updating_value_1;
    	let t6;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	function hourtime_value_binding(value) {
    		/*hourtime_value_binding*/ ctx[7].call(null, value);
    	}

    	let hourtime_props = {};

    	if (/*hour*/ ctx[0] !== void 0) {
    		hourtime_props.value = /*hour*/ ctx[0];
    	}

    	hourtime = new HourTime({ props: hourtime_props, $$inline: true });
    	binding_callbacks.push(() => bind(hourtime, "value", hourtime_value_binding));

    	function mintim_value_binding(value) {
    		/*mintim_value_binding*/ ctx[8].call(null, value);
    	}

    	let mintim_props = {};

    	if (/*min*/ ctx[1] !== void 0) {
    		mintim_props.value = /*min*/ ctx[1];
    	}

    	mintim = new MinTime({ props: mintim_props, $$inline: true });
    	binding_callbacks.push(() => bind(mintim, "value", mintim_value_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add or Update Alert";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			p = element("p");
    			p.textContent = "Select an interval:";
    			t4 = space();
    			div0 = element("div");
    			create_component(hourtime.$$.fragment);
    			t5 = space();
    			create_component(mintim.$$.fragment);
    			t6 = space();
    			button = element("button");
    			button.textContent = "Alert";
    			add_location(h1, file$2, 50, 4, 1317);
    			attr_dev(input, "type", "message");
    			attr_dev(input, "placeholder", "Alert me for...");
    			attr_dev(input, "id", "message");
    			attr_dev(input, "class", "svelte-o2qpwt");
    			add_location(input, file$2, 51, 4, 1351);
    			attr_dev(p, "class", "interval svelte-o2qpwt");
    			add_location(p, file$2, 52, 4, 1469);
    			attr_dev(div0, "class", "time svelte-o2qpwt");
    			add_location(div0, file$2, 53, 4, 1518);
    			attr_dev(button, "class", "submitBtn");
    			attr_dev(button, "type", "button");
    			add_location(button, file$2, 57, 4, 1625);
    			attr_dev(div1, "class", "editAlert");
    			add_location(div1, file$2, 48, 2, 1286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, input);
    			set_input_value(input, /*newMessage*/ ctx[2]);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			mount_component(hourtime, div0, null);
    			append_dev(div0, t5);
    			mount_component(mintim, div0, null);
    			append_dev(div1, t6);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					action_destroyer(selectTextOnFocus_action = selectTextOnFocus.call(null, input)),
    					listen_dev(button, "click", /*onSubmit*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newMessage*/ 4) {
    				set_input_value(input, /*newMessage*/ ctx[2]);
    			}

    			const hourtime_changes = {};

    			if (!updating_value && dirty & /*hour*/ 1) {
    				updating_value = true;
    				hourtime_changes.value = /*hour*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			hourtime.$set(hourtime_changes);
    			const mintim_changes = {};

    			if (!updating_value_1 && dirty & /*min*/ 2) {
    				updating_value_1 = true;
    				mintim_changes.value = /*min*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			mintim.$set(mintim_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hourtime.$$.fragment, local);
    			transition_in(mintim.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hourtime.$$.fragment, local);
    			transition_out(mintim.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(hourtime);
    			destroy_component(mintim);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:0) {#if isAddOrUpdateAlert}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isAddOrUpdateAlert*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Toggle New Alert";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "class", "newAlertBtn");
    			add_location(button, file$2, 46, 2, 1177);
    			attr_dev(div, "class", "newAlert");
    			add_location(div, file$2, 45, 0, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleNewAlert*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isAddOrUpdateAlert*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isAddOrUpdateAlert*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function selectTextOnFocus(node) {
    	const handleFocus = event => {
    		node && typeof node.select === "function" && node.select();
    	};

    	node.addEventListener("focus", handleFocus);

    	return {
    		destroy() {
    			node.removeEventListener("focus", handleFocus);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $interval;
    	let $stop;
    	let $nextAlert;
    	let $message;
    	let $createdAt;
    	validate_store(interval, "interval");
    	component_subscribe($$self, interval, $$value => $$invalidate(9, $interval = $$value));
    	validate_store(stop, "stop");
    	component_subscribe($$self, stop, $$value => $$invalidate(10, $stop = $$value));
    	validate_store(nextAlert, "nextAlert");
    	component_subscribe($$self, nextAlert, $$value => $$invalidate(11, $nextAlert = $$value));
    	validate_store(message, "message");
    	component_subscribe($$self, message, $$value => $$invalidate(12, $message = $$value));
    	validate_store(createdAt, "createdAt");
    	component_subscribe($$self, createdAt, $$value => $$invalidate(13, $createdAt = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewAlert", slots, []);
    	let hour = 0;
    	let min = 5;
    	let newMessage = "";
    	let isAddOrUpdateAlert = false;

    	const onSubmit = e => {
    		clearInterval($interval);
    		set_store_value(stop, $stop = true, $stop);
    		const today = new Date();
    		today.setHours(today.getHours() + hour, today.getMinutes() + min, 0, 0);
    		set_store_value(nextAlert, $nextAlert = today, $nextAlert);
    		set_store_value(message, $message = newMessage, $message);
    		set_store_value(createdAt, $createdAt = new Date(), $createdAt);

    		// console.log({ nextAlert: $nextAlert , today: new Date(), interval: $interval })
    		set_store_value(stop, $stop = false, $stop);

    		toggleNewAlert();
    	};

    	function toggleNewAlert() {
    		$$invalidate(3, isAddOrUpdateAlert = !isAddOrUpdateAlert);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewAlert> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newMessage = this.value;
    		$$invalidate(2, newMessage);
    	}

    	function hourtime_value_binding(value) {
    		hour = value;
    		$$invalidate(0, hour);
    	}

    	function mintim_value_binding(value) {
    		min = value;
    		$$invalidate(1, min);
    	}

    	$$self.$capture_state = () => ({
    		HourTime,
    		MinTim: MinTime,
    		message,
    		nextAlert,
    		createdAt,
    		stop,
    		interval,
    		hour,
    		min,
    		newMessage,
    		isAddOrUpdateAlert,
    		onSubmit,
    		selectTextOnFocus,
    		toggleNewAlert,
    		$interval,
    		$stop,
    		$nextAlert,
    		$message,
    		$createdAt
    	});

    	$$self.$inject_state = $$props => {
    		if ("hour" in $$props) $$invalidate(0, hour = $$props.hour);
    		if ("min" in $$props) $$invalidate(1, min = $$props.min);
    		if ("newMessage" in $$props) $$invalidate(2, newMessage = $$props.newMessage);
    		if ("isAddOrUpdateAlert" in $$props) $$invalidate(3, isAddOrUpdateAlert = $$props.isAddOrUpdateAlert);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hour,
    		min,
    		newMessage,
    		isAddOrUpdateAlert,
    		onSubmit,
    		toggleNewAlert,
    		input_input_handler,
    		hourtime_value_binding,
    		mintim_value_binding
    	];
    }

    class NewAlert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewAlert",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\component\Timer.svelte generated by Svelte v3.29.0 */
    const file$3 = "src\\component\\Timer.svelte";

    // (49:0) {#if !$stop }
    function create_if_block$1(ctx) {
    	let h1;
    	let t_value = /*$timeString*/ ctx[1].string + "";
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(t_value);
    			attr_dev(h1, "class", "timer svelte-1fofxpx");
    			toggle_class(h1, "isRed", /*isLessThanMin*/ ctx[0]);
    			add_location(h1, file$3, 49, 2, 1066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$timeString*/ 2 && t_value !== (t_value = /*$timeString*/ ctx[1].string + "")) set_data_dev(t, t_value);

    			if (dirty & /*isLessThanMin*/ 1) {
    				toggle_class(h1, "isRed", /*isLessThanMin*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:0) {#if !$stop }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = !/*$stop*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*$stop*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $timeString;
    	let $interval;
    	let $nextAlert;
    	let $alertBox;
    	let $currentTime;
    	let $stop;
    	validate_store(timeString, "timeString");
    	component_subscribe($$self, timeString, $$value => $$invalidate(1, $timeString = $$value));
    	validate_store(interval, "interval");
    	component_subscribe($$self, interval, $$value => $$invalidate(3, $interval = $$value));
    	validate_store(nextAlert, "nextAlert");
    	component_subscribe($$self, nextAlert, $$value => $$invalidate(4, $nextAlert = $$value));
    	validate_store(alertBox, "alertBox");
    	component_subscribe($$self, alertBox, $$value => $$invalidate(5, $alertBox = $$value));
    	validate_store(currentTime, "currentTime");
    	component_subscribe($$self, currentTime, $$value => $$invalidate(6, $currentTime = $$value));
    	validate_store(stop, "stop");
    	component_subscribe($$self, stop, $$value => $$invalidate(2, $stop = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Timer", slots, []);

    	onMount(() => {
    		clearInterval($interval);
    		initTimer();
    	});

    	onDestroy(() => {
    		// $stop = true;
    		clearInterval($interval);
    	});

    	function initTimer() {
    		clearInterval($interval);

    		set_store_value(
    			interval,
    			$interval = setInterval(
    				async () => {
    					// console.log("test leak")
    					if ($timeString.total <= 0) {
    						await playAlert();
    						set_store_value(alertBox, $alertBox = true, $alertBox);
    						clearInterval($interval);
    						return;
    					}

    					set_store_value(currentTime, $currentTime = new Date(), $currentTime);
    				},
    				500
    			),
    			$interval
    		);
    	}

    	interval.subscribe(val => {
    		if (val && $stop) clearInterval($interval);
    	});

    	stop.subscribe(val => {
    		if (val) {
    			clearInterval($interval);
    		} else {
    			clearInterval($interval);
    			initTimer();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		nextAlert,
    		stop,
    		interval,
    		timeString,
    		alertBox,
    		currentTime,
    		playAlert,
    		initTimer,
    		isLessThanMin,
    		$timeString,
    		$interval,
    		$nextAlert,
    		$alertBox,
    		$currentTime,
    		$stop
    	});

    	$$self.$inject_state = $$props => {
    		if ("isLessThanMin" in $$props) $$invalidate(0, isLessThanMin = $$props.isLessThanMin);
    	};

    	let isLessThanMin;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$timeString*/ 2) {
    			 $$invalidate(0, isLessThanMin = $timeString && $timeString.total < 1000 * 60);
    		}
    	};

    	return [isLessThanMin, $timeString, $stop];
    }

    class Timer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\component\ShowAlert.svelte generated by Svelte v3.29.0 */
    const file$4 = "src\\component\\ShowAlert.svelte";

    // (6:0) {#if !$stop }
    function create_if_block$2(ctx) {
    	let h1;
    	let t1;
    	let div1;
    	let timer;
    	let t2;
    	let div0;
    	let p;
    	let t3;
    	let current;
    	timer = new Timer({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Upcoming Alert In";
    			t1 = space();
    			div1 = element("div");
    			create_component(timer.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			t3 = text(/*$message*/ ctx[1]);
    			attr_dev(h1, "class", "title svelte-1qxcc3n");
    			add_location(h1, file$4, 6, 2, 127);
    			attr_dev(p, "class", "svelte-1qxcc3n");
    			add_location(p, file$4, 11, 6, 247);
    			attr_dev(div0, "class", "message svelte-1qxcc3n");
    			add_location(div0, file$4, 10, 4, 218);
    			attr_dev(div1, "class", "alert svelte-1qxcc3n");
    			add_location(div1, file$4, 7, 2, 172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(timer, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$message*/ 2) set_data_dev(t3, /*$message*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(timer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(6:0) {#if !$stop }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*$stop*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*$stop*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$stop*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $stop;
    	let $message;
    	validate_store(stop, "stop");
    	component_subscribe($$self, stop, $$value => $$invalidate(0, $stop = $$value));
    	validate_store(message, "message");
    	component_subscribe($$self, message, $$value => $$invalidate(1, $message = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ShowAlert", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ShowAlert> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ message, stop, Timer, $stop, $message });
    	return [$stop, $message];
    }

    class ShowAlert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShowAlert",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\component\pop\AlertBox.svelte generated by Svelte v3.29.0 */
    const file$5 = "src\\component\\pop\\AlertBox.svelte";

    // (10:0) {#if $alertBox}
    function create_if_block$3(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let p0;
    	let t1;
    	let div0;
    	let button;
    	let t3;
    	let div2;
    	let p1;
    	let t4;
    	let span;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Alert";
    			t1 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "X";
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t4 = text("Are you still doing?\r\n          ");
    			span = element("span");
    			t5 = text(/*$message*/ ctx[1]);
    			attr_dev(p0, "class", "title-content svelte-l7yw22");
    			add_location(p0, file$5, 13, 8, 291);
    			attr_dev(button, "class", "close svelte-l7yw22");
    			add_location(button, file$5, 15, 10, 364);
    			attr_dev(div0, "class", "btn");
    			add_location(div0, file$5, 14, 8, 335);
    			attr_dev(div1, "class", "title svelte-l7yw22");
    			add_location(div1, file$5, 12, 6, 262);
    			add_location(span, file$5, 21, 10, 539);
    			attr_dev(p1, "class", "svelte-l7yw22");
    			add_location(p1, file$5, 20, 8, 504);
    			attr_dev(div2, "class", "message svelte-l7yw22");
    			add_location(div2, file$5, 19, 6, 473);
    			attr_dev(div3, "class", "alert-box svelte-l7yw22");
    			add_location(div3, file$5, 11, 4, 231);
    			attr_dev(div4, "class", "overlay svelte-l7yw22");
    			add_location(div4, file$5, 10, 2, 204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t4);
    			append_dev(p1, span);
    			append_dev(span, t5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$message*/ 2) set_data_dev(t5, /*$message*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(10:0) {#if $alertBox}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*$alertBox*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$alertBox*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $alertBox;
    	let $message;
    	validate_store(alertBox, "alertBox");
    	component_subscribe($$self, alertBox, $$value => $$invalidate(0, $alertBox = $$value));
    	validate_store(message, "message");
    	component_subscribe($$self, message, $$value => $$invalidate(1, $message = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AlertBox", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AlertBox> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(alertBox, $alertBox = false, $alertBox);

    	$$self.$capture_state = () => ({
    		onMount,
    		alertBox,
    		message,
    		$alertBox,
    		$message
    	});

    	return [$alertBox, $message, click_handler];
    }

    class AlertBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AlertBox",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.0 */
    const file$6 = "src\\App.svelte";

    function create_fragment$6(ctx) {
    	let title_value;
    	let link;
    	let t0;
    	let showalert;
    	let t1;
    	let alertbox;
    	let t2;
    	let newalert;
    	let current;
    	document.title = title_value = /*newTitle*/ ctx[0];
    	showalert = new ShowAlert({ $$inline: true });
    	alertbox = new AlertBox({ $$inline: true });
    	newalert = new NewAlert({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			create_component(showalert.$$.fragment);
    			t1 = space();
    			create_component(alertbox.$$.fragment);
    			t2 = space();
    			create_component(newalert.$$.fragment);
    			attr_dev(link, "href", "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$6, 30, 1, 717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(showalert, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(alertbox, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(newalert, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*newTitle*/ 1) && title_value !== (title_value = /*newTitle*/ ctx[0])) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(showalert.$$.fragment, local);
    			transition_in(alertbox.$$.fragment, local);
    			transition_in(newalert.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(showalert.$$.fragment, local);
    			transition_out(alertbox.$$.fragment, local);
    			transition_out(newalert.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			destroy_component(showalert, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(alertbox, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(newalert, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		timeString.subscribe($timeString => {
    			if ($timeString.total > 0) $$invalidate(0, newTitle = $timeString.string);
    		});

    		stop.subscribe($stop => {
    			if ($stop) $$invalidate(0, newTitle = "Timer");
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		NewAlert,
    		ShowAlert,
    		AlertBox,
    		timeString,
    		stop,
    		newTitle
    	});

    	$$self.$inject_state = $$props => {
    		if ("newTitle" in $$props) $$invalidate(0, newTitle = $$props.newTitle);
    	};

    	let newTitle;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, newTitle = "Timer");
    	return [newTitle];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
