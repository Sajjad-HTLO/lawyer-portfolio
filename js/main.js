/* ============================================================
   وکیل — منطق اصلی وب‌سایت
   محتوا از js/config.js خوانده و در همین جا رندر می‌شود.
   ============================================================ */
(function () {
  "use strict";

  var D = window.SITE_DATA || {};
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  function icon(name) {
    return '<svg aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
  }
  function el(key) {
    return document.querySelector('[data-render="' + key + '"]');
  }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }
  function toFaDigits(s) {
    return String(s).replace(/[۰-۹]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 1728);
    }).replace(/[٠-٩]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 1584);
    });
  }
  function headHTML(kicker, title, lead) {
    var html = "";
    if (kicker) html += '<p class="kicker">' + esc(kicker) + "</p>";
    if (title) html += '<h2 class="section-title">' + esc(title) + "</h2>";
    if (lead) html += "<p class='section-lead'>" + esc(lead) + "</p>";
    return html;
  }
  function imgHTML(src, alt, cls) {
    if (!src) return "";
    return '<img class="' + (cls || "") + '" src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" width="800" height="1000">';
  }

  /* ---------- text/data fill ---------- */
  function fillTexts() {
    document.querySelectorAll("[data-text]").forEach(function (node) {
      var path = node.getAttribute("data-text").split(".");
      var v = D;
      for (var i = 0; i < path.length && v; i++) v = v[path[i]];
      if (v != null) node.textContent = v;
    });
    var cta = D.nav && D.nav.cta;
    if (cta) {
      document.querySelectorAll("[data-href='nav.cta']").forEach(function (a) {
        a.setAttribute("href", cta.href || "#consultation");
        a.textContent = cta.label || "";
      });
    }
  }

  /* ---------- section renderers ---------- */
  function renderHero() {
    var h = D.hero || {};
    var l = D.lawyer || {};
    var node;

    node = el("hero.label");
    if (node && h.label) node.textContent = h.label;

    node = el("hero.name");
    if (node && h.name) node.innerHTML = h.name;

    node = el("hero.statement");
    if (node && h.statement) node.textContent = h.statement;

    node = el("hero.description");
    if (node && h.description) node.textContent = h.description;

    node = el("hero.cta");
    if (node) {
      var html = "";
      if (h.secondaryCta) {
        html += '<a class="btn btn--ghost hero-btn hero-btn--ghost" href="' + esc(h.secondaryCta.href) + '">' + icon("phone") + esc(h.secondaryCta.label) + "</a>";
      }
      if (h.primaryCta) {
        html += '<a class="btn btn--gold hero-btn hero-btn--gold" href="' + esc(h.primaryCta.href) + '">' + esc(h.primaryCta.label) + " " + icon("arrow") + "</a>";
      }
      node.innerHTML = html;
    }

    node = el("hero.meta");
    if (node) {
      if (h.metadata && h.metadata.length) {
        node.hidden = false;
        node.innerHTML = h.metadata.map(function (m) {
          return '<div class="hero-meta-item"><span>' + esc(m.label) + "</span><strong>" + esc(m.value) + "</strong></div>";
        }).join("");
      } else {
        node.hidden = true;
      }
    }

    var img = document.querySelector("[data-hero-img]");
    if (img) {
      var src = (D.hero && D.hero.image) || "";
      if (src) {
        img.src = src;
        img.removeAttribute("aria-hidden");
        img.setAttribute("alt", (l.name || "وکیل") + " — تصویر بخش اول");
      } else {
        img.hidden = true;
      }
    }
  }

  function renderTrust() {
    var grid = document.getElementById("trust-grid");
    if (!grid) return;
    grid.innerHTML = (D.trustStats || []).map(function (s) {
      return '<div class="trust-item reveal">' +
        '<span class="trust-icon" aria-hidden="true">' + s.icon + "</span>" +
        '<div class="trust-value">' + esc(s.value) + "<sup>" + esc(s.suffix) + "</sup></div>" +
        '<div class="trust-label">' + esc(s.label) + "</div>" +
      "</div>";
    }).join("");
  }

  function renderHead(sectionKey, cfg) {
    var node = el(sectionKey + ".head");
    if (node) node.innerHTML = headHTML(cfg.kicker, cfg.title, cfg.lead);
  }

  function renderPractice() {
    var grid = document.getElementById("practice-grid");
    if (!grid) return;
    grid.innerHTML = (D.practiceAreas || []).map(function (a) {
      return '<article class="practice-card reveal">' +
        '<span class="practice-icon" aria-hidden="true">' + a.icon + "</span>" +
        "<h3>" + esc(a.title) + "</h3>" +
        "<p>" + esc(a.description) + "</p>" +
        '<a class="practice-link" href="#contact">مشاهده جزئیات ' + icon("arrow") + "</a>" +
      "</article>";
    }).join("");
  }

  function renderTimeline() {
    var cfg = { kicker: "", title: "سوابق حرفه‌ای", lead: "" };
    renderHead("timeline", cfg);
    var node = el("timeline.items");
    var items = D.experience || [];
    if (node) {
      node.innerHTML = items.map(function (it) {
        return "<li class='reveal'>" +
          '<span class="tl-year">' + esc(it.year) + "</span>" +
          "<h3>" + esc(it.title) + "</h3>" +
          (it.organization ? '<span class="tl-org">' + esc(it.organization) + "</span>" : "") +
          "<p>" + esc(it.description) + "</p></li>";
      }).join("");
    }
  }

  function renderLegal() {
    var cfg = { kicker: "", title: "تجربه و زمینه‌های حرفه‌ای", lead: (D.legalExperience || {}).intro || "" };
    renderHead("legal", cfg);
    var node = el("legal.items");
    var items = (D.legalExperience || {}).cases || [];
    if (node) {
      node.innerHTML = items.map(function (c, i) {
        return '<article class="legal-card reveal reveal-delay-' + (i % 3) + '">' +
          '<span class="legal-cat">' + esc(c.category) + "</span>" +
          "<p>" + esc(c.description) + "</p>" +
          '<span class="legal-result">' + icon("check") + esc(c.result) + "</span>" +
        "</article>";
      }).join("");
    }
  }

  function renderWhy() {
    var cfg = { kicker: "", title: "چرا من را انتخاب کنید؟", lead: "" };
    renderHead("why", cfg);
    var node = el("why.items");
    var items = D.whyChooseMe || [];
    if (node) {
      node.innerHTML = items.map(function (it, i) {
        return '<article class="why-card reveal reveal-delay-' + (i % 3) + '">' +
          '<span class="why-num" aria-hidden="true">' + esc(it.number) + "</span>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.description) + "</p>" +
        "</article>";
      }).join("");
    }
  }

  function renderTestimonials() {
    var cfg = { kicker: "", title: "نظر موکلین", lead: "نام موکلین بدون اجازه نمایش داده نمی‌شود." };
    renderHead("testi", cfg);
    var node = el("testi.slider");
    var items = D.testimonials || [];
    if (!node || !items.length) return;
    node.innerHTML =
      '<div class="slider-track">' +
        '<div class="slider-slides" role="region" aria-roledescription="کاروسل" aria-label="نظرات موکلین">' +
          items.map(function (t, i) {
            return '<figure class="slide">' +
              '<div class="testi-card">' +
                '<svg class="t-quote-mark" aria-hidden="true"><use href="#i-quote"/></svg>' +
                "<blockquote><p>" + esc(t.quote) + "</p></blockquote>" +
                '<figcaption class="testi-person">' +
                  "<strong>" + esc(t.name) + "</strong>" +
                  (t.category ? "<span>" + esc(t.category) + "</span>" : "") +
                "</figcaption>" +
              "</div></figure>";
          }).join("") +
        "</div>" +
      "</div>" +
      '<div class="slider-controls">' +
        '<button class="slider-arrow is-prev" data-slide-prev type="button" aria-label="نظر قبلی">' + icon("arrow") + "</button>" +
        '<div class="slider-dots" role="tablist" aria-label="انتخاب نظر"></div>' +
        '<button class="slider-arrow" data-slide-next type="button" aria-label="نظر بعدی">' + icon("arrow") + "</button>" +
      "</div>";
    initSlider();
  }

  function initSlider() {
    var slidesEl = document.querySelector(".slider-slides");
    if (!slidesEl) return;
    var isRTL = getComputedStyle(document.documentElement).direction === "rtl";
    var slides = Array.prototype.slice.call(slidesEl.children);
    var dotsWrap = document.querySelector(".slider-dots");
    var prev = document.querySelector("[data-slide-prev]");
    var next = document.querySelector("[data-slide-next]");
    var index = 0;
    var timer = null;
    var total = slides.length;

    dotsWrap.innerHTML = slides.map(function (_, i) {
      return '<button type="button" data-slide-dot="' + i + '" aria-label="رفتن به نظر ' + (i + 1) + '"></button>';
    }).join("");
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(i) {
      index = (i + total) % total;
      var shift = index * 100;
      slidesEl.style.transform = "translateX(" + (isRTL ? shift : -shift) + "%)";
      slides.forEach(function (s, k) {
        s.setAttribute("aria-hidden", k === index ? "false" : "true");
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === index); });
      prev.disabled = false;
      next.disabled = false;
    }
    function autoplay() {
      if (prefersReduced || total <= 1) return;
      stop();
      timer = setInterval(function () { go(index + 1); }, 6500);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    prev.addEventListener("click", function () { stop(); go(index - 1); autoplay(); });
    next.addEventListener("click", function () { stop(); go(index + 1); autoplay(); });
    dotsWrap.addEventListener("click", function (e) {
      var d = e.target.closest("[data-slide-dot]");
      if (!d) return;
      stop(); go(Number(d.getAttribute("data-slide-dot"))); autoplay();
    });
    var slider = document.querySelector(".slider");
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", autoplay);
    slidesEl.addEventListener("touchstart", function (e) {
      if (prefersReduced) return;
      this._tx = e.touches[0].clientX;
    }, { passive: true });
    slidesEl.addEventListener("touchend", function (e) {
      if (this._tx == null || prefersReduced) return;
      var dx = e.changedTouches[0].clientX - this._tx;
      if (Math.abs(dx) > 40) { stop(); go(index + (dx > 0 ? -1 : 1)); autoplay(); }
      this._tx = null;
    });

    go(0);
    autoplay();
  }

  function renderFaq() {
    var cfg = { kicker: "", title: "سوالات متداول", lead: "" };
    renderHead("faq", cfg);
    var node = el("faq.items");
    var items = D.faq || [];
    if (!node) return;
    node.innerHTML = items.map(function (it, i) {
      return '<div class="faq-item">' +
        '<h3 class="faq-q">' +
          '<button type="button" id="faq-btn-' + i + '" aria-expanded="false" aria-controls="faq-panel-' + i + '">' +
            "<span>" + esc(it.q) + "</span>" + icon("chevron") +
          "</button>" +
        "</h3>" +
        '<div class="faq-a" id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '" hidden>' +
          "<p>" + esc(it.a) + "</p>" +
        "</div>" +
      "</div>";
    }).join("");

    var itemsEls = node.querySelectorAll(".faq-item");
    var btns = node.querySelectorAll(".faq-q button");

    function openItem(idx) {
      itemsEls.forEach(function (item, k) {
        var isOpen = k === idx;
        var btn = btns[k];
        var panel = document.getElementById("faq-panel-" + k);
        if (isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          panel.style.maxHeight = "0px";
          requestAnimationFrame(function () { panel.style.maxHeight = panel.scrollHeight + "px"; });
        } else {
          item.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
          panel.style.maxHeight = "0px";
          setTimeout(function () { panel.hidden = true; }, 260);
        }
      });
    }

    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        var already = btn.getAttribute("aria-expanded") === "true";
        openItem(already ? -1 : i);
      });
    });

    if (items.length) openItem(0);
  }

  function renderCta() {
    var c = D.cta || {};
    var node = el("cta.content");
    if (!node) return;
    var html = "<h2 id='cta-title'>" + esc(c.title) + "</h2>" +
      "<p>" + esc(c.text) + "</p>" +
      '<div class="hero-cta">' +
        (c.primary ? '<a class="btn btn--gold" href="' + esc(c.primary.href) + '">' + esc(c.primary.label) + " " + icon("arrow") + "</a>" : "") +
        (c.secondary ? '<a class="btn btn--ghost" href="' + esc(c.secondary.href) + '">' + icon("phone") + esc(c.secondary.label) + "</a>" : "") +
      "</div>";
    node.innerHTML = html;
  }

  function renderContact() {
    var cfg = { kicker: "", title: "تماس با من", lead: "فرم زیر را تکمیل کنید یا با اطلاعات تماس، مستقیم در ارتباط باشید." };
    renderHead("contact", cfg);
    var l = D.lawyer || {};
    var c = D.contact || {};

    var node = el("contact.cards");
    if (node) {
      var cards = (c.cards || []).slice();
      if (l.whatsapp && l.whatsappHref) {
        cards.splice(2, 0, { icon: "whatsapp", label: "واتساپ", value: l.whatsapp, href: l.whatsappHref });
      }
      node.innerHTML = cards.map(function (card) {
        var inner = card.href ? '<a href="' + esc(card.href) + '"><strong>' + esc(card.value) + "</strong></a>" : "<strong>" + esc(card.value) + "</strong>";
        return '<div class="contact-item">' +
          '<div class="area-icon">' + icon(card.icon) + "</div>" +
          "<div><span>" + esc(card.label) + "</span>" + inner + "</div></div>";
      }).join("");
    }

    var formWrap = el("contact.form");
    if (formWrap) {
      var f = c.form || {};
      var fields = f.fields || {};
      function fieldHTML(key, fld) {
        var req = fld.required ? '<span class="req" aria-hidden="true"> *</span>' : "";
        var label = '<label for="cf-' + key + '">' + esc(fld.label) + req + "</label>";
        var input = "";
        if (fld.type === "select") {
          input = '<select id="cf-' + key + '" name="' + key + '"' + (fld.required ? " required" : "") + ">" +
            '<option value="" disabled selected>انتخاب کنید…</option>' +
            (fld.options || []).map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("") +
            "</select>";
        } else if (fld.type === "textarea") {
          input = '<textarea id="cf-' + key + '" name="' + key + '" placeholder="' + esc(fld.placeholder || "") + '"' + (fld.required ? " required" : "") + "></textarea>";
        } else {
          var dirAttr = (key === "email" || key === "phone") ? ' dir="ltr" style="text-align:left"' : "";
          input = '<input id="cf-' + key + '" name="' + key + '" type="' + (fld.type || "text") + '" placeholder="' + esc(fld.placeholder || "") + '"' + dirAttr + (fld.required ? " required" : "") + ">";
        }
        return '<div class="form-group" data-field="' + key + '">' + label + input +
          '<p class="form-error" aria-live="polite"></p></div>';
      }
      var html = '<p class="contact-form-note">' + esc(f.note || "") + "</p>" +
        '<div class="form-row">' + fieldHTML("name", fields.name) + fieldHTML("phone", fields.phone) + "</div>" +
        fieldHTML("email", fields.email) +
        fieldHTML("subject", fields.subject) +
        fieldHTML("message", fields.message) +
        '<button class="btn btn--gold" type="submit" data-submit>' + icon("arrow") + '<span>' + esc(f.submit || "ارسال") + "</span></button>";
      formWrap.innerHTML = html + '<div class="form-success"><div class="ok-icon">' + icon("check") + "</div><h3>با تشکر از شما</h3><p>" + esc(f.success || "") + "</p></div>";
      initForm(formWrap, f);
    }

    var mapEl = el("contact.map");
    if (mapEl) {
      var src = (c.map || {}).embedUrl || "";
      if (src) {
        mapEl.innerHTML = '<iframe title="موقعیت دفتر روی نقشه" src="' + esc(src) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      } else {
        mapEl.innerHTML = '<div class="map-placeholder">' + icon("pin") +
          "<strong>موقعیت دفتر روی نقشه</strong>" +
          "<small>برای نمایش نقشه، لینک embed نقشه‌ی گوگل را در <code>js/config.js</code> بخش <code>contact.map.embedUrl</code> قرار دهید.</small></div>";
      }
    }
  }

  /* لایه‌ی انتزاعی ارسال درخواست مشاوره — برای اتصال به سرویس واقعی
     این تابع را با درخواست API یا سرویس ایمیل جایگزین کنید. */
  function submitConsultationRequest(payload, endpoint) {
    if (endpoint) {
      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error("request failed");
        return r;
      });
    }
    /* شبیه‌سازی ارسال بدون backend — در حال حاضر با موفقیت کامل می‌شود. */
    return new Promise(function (resolve) {
      setTimeout(resolve, 700);
    });
  }

  function initForm(formEl, cfg) {
    var groups = formEl.querySelectorAll("[data-field]");
    var submitBtn = formEl.querySelector("[data-submit]");
    var successEl = formEl.querySelector(".form-success");
    var submitLabel = submitBtn.querySelector("span");

    function getField(key) { return formEl.querySelector("#cf-" + key); }
    function setError(key, msg) {
      var group = formEl.querySelector('[data-field="' + key + '"]');
      if (!group) return;
      var err = group.querySelector(".form-error");
      if (msg) { group.classList.add("is-error"); err.textContent = msg; }
      else { group.classList.remove("is-error"); err.textContent = ""; }
    }

    function validators(key) {
      var val = getField(key) ? getField(key).value.trim() : "";
      var digits = toFaDigits(val).replace(/\s+/g, "");
      switch (key) {
        case "name":
          if (!val) return "لطفاً نام و نام خانوادگی را وارد کنید.";
          if (val.length < 2) return "نام باید حداقل ۲ حرف باشد.";
          return "";
        case "phone":
          if (!val) return "لطفاً شماره تماس را وارد کنید.";
          if (!/^(\+?\d{10,13})$/.test(digits)) return "شماره تماس معتبر نیست.";
          return "";
        case "email":
          if (!val) return "";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return "ایمیل واردشده معتبر نیست.";
          return "";
        case "subject":
          if (!val) return "لطفاً موضوع را انتخاب کنید.";
          return "";
        case "message":
          if (!val) return "لطفاً توضیحات را بنویسید.";
          if (val.length < 10) return "توضیحات باید حداقل ۱۰ حرف باشد.";
          return "";
      }
      return "";
    }

    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      var valid = true;
      groups.forEach(function (g) {
        var key = g.getAttribute("data-field");
        var msg = validators(key);
        setError(key, msg);
        if (msg) { valid = false; if (!firstBad) firstBad = g; }
      });
      if (!valid) {
        if (firstBad) { var input = firstBad.querySelector("input, select, textarea"); if (input) input.focus(); }
        return;
      }

      var btn = submitBtn;
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      submitLabel.textContent = cfg.sending || "در حال ارسال…";

      var payload = {};
      groups.forEach(function (g) {
        var key = g.getAttribute("data-field");
        var input = getField(key);
        if (input) payload[key] = input.value;
      });

      submitConsultationRequest(payload, cfg.formEndpoint)
        .then(function () {
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          submitLabel.textContent = cfg.submit || "ارسال";
          formEl.classList.add("form-hidden");
          successEl.classList.add("is-visible");
        })
        .catch(function () {
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          submitLabel.textContent = cfg.submit || "ارسال";
          successEl.querySelector("p").textContent = cfg.error || "خطایی رخ داد.";
          successEl.classList.add("is-visible");
          formEl.classList.add("form-hidden");
        });
    });

    groups.forEach(function (g) {
      var input = g.querySelector("input, select, textarea");
      if (input) input.addEventListener("input", function () {
        if (g.classList.contains("is-error")) setError(g.getAttribute("data-field"), "");
      });
    });
  }

  function renderFooter() {
    var f = D.footer || {};
    var node;

    node = el("footer.disclaimer");
    if (node && f.disclaimer) {
      node.textContent = f.disclaimer;
    }
    node = el("footer.bottom");
    if (node) node.textContent = f.copyright || "";
  }

  function renderMobileBar() {
    var node = el("mobile.bar");
    if (!node) return;
    var l = D.lawyer || {};
    var items = [
      { label: "تماس", icon: "phone", href: l.phoneHref || "#contact" }
    ];
    if (l.whatsapp && l.whatsappHref) {
      items.push({ label: "واتساپ", icon: "whatsapp", href: l.whatsappHref });
    }
    items.push({ label: "درخواست مشاوره", icon: "chat", href: "#contact" });

    var html = '<div class="mobile-bar-inner">' + items.map(function (item) {
      return '<a class="mobile-bar-item" href="' + esc(item.href) + '">' + icon(item.icon) + "<span>" + esc(item.label) + "</span></a>";
    }).join("") + "</div>";
    node.innerHTML = html;
  }

  /* ---------- navigation & UX ---------- */
  function initNav() {
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    var toTop = document.getElementById("to-top");

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (toTop) toTop.classList.toggle("is-visible", y > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeNav() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "باز کردن منو");
    }

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
      });
      document.addEventListener("click", function (e) {
        if (nav.classList.contains("is-open") &&
            !nav.contains(e.target) && !toggle.contains(e.target)) {
          closeNav();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
      });
      nav.querySelectorAll("a[data-nav-link], a.nav-cta").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
    }

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      });
    }

    var navLinks = Array.prototype.slice.call(document.querySelectorAll("a[data-nav-link]"));
    var sections = navLinks.map(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    var spys = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spys.observe(s); });
  }

  function initReveal() {
    if (prefersReduced) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  /* ---------- boot ---------- */
  function boot() {
    fillTexts();
    renderNav();
    renderHero();
    renderTrust();
    renderPractice();
    renderTimeline();
    renderLegal();
    renderWhy();
    renderTestimonials();
    renderFaq();
    renderCta();
    renderContact();
    renderFooter();
    renderMobileBar();
    initNav();
    initReveal();

    var name = (D.brand && D.brand.name) || (D.lawyer && D.lawyer.name) || "وکیل";
    document.title = name + " | " + ((D.lawyer && D.lawyer.title) || "وکیل");
  }

  function renderNav() {
    var links = D.nav && D.nav.links;
    if (!links) return;
    var ul = document.getElementById("nav-links");
    if (!ul) return;
    ul.innerHTML = links.map(function (l) {
      return '<li><a data-nav-link href="' + esc(l.href) + '">' + esc(l.label) + "</a></li>";
    }).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();