var m_paint;
var m_analyzer;
var m_mouse;
var m_renderer;
var m_render_queue;
var m_device_checker;
var m_ctrl;


var init = function(){

    m_device_checker = new DeviceChecker();
    var _is_mobile = m_device_checker.is_mobile();
    var _is_retina = m_device_checker.is_retina();

    m_mouse = new MouseHandler();
    m_mouse.register_dom_events(document.body);

    m_analyzer = new AudioAnalyzer();

    m_renderer = new ThreeSharedRenderer(false);
    m_renderer.append_renderer_to_dom(document.body);

    m_paint = new PaintBoard(m_renderer, m_analyzer, m_mouse, _is_retina, _is_mobile);

    m_render_queue = [
        m_paint.update.bind(m_paint)
    ];

    m_ctrl = new Ctrl(m_analyzer, m_paint);

};


var update = function(){
    requestAnimationFrame( update );

    m_analyzer.update();
    m_paint.update();
    m_renderer.render(m_render_queue);



};


document.addEventListener('DOMContentLoaded', function(){
    if(window.location.protocol == 'http:' && window.location.hostname != "localhost"){
        window.open("https://" + window.location.hostname + window.location.pathname,'_top');
    } else {
        init();
        update();
    }
});
