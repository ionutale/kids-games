<script>
  // A little harbor stamp for the album. The age is only used for the label.
  let { age = 3 } = $props();
</script>

<div class="postcard" data-testid="postcard" data-age={age} aria-hidden="true">
  <div class="art">
    <span class="sun"></span>
    <span class="sea"></span>
    <span class="sand"></span>
    <span class="light"></span>
    <span class="boat">⛵</span>
  </div>
  <span class="stamp">⚓</span>
</div>

<style>
  .postcard {
    position: relative;
    width: 100%;
    aspect-ratio: 1.42;
    border-radius: 6px;
    background: #fff8ec;
    border: 1.5px solid #c9b79c;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.22);
    overflow: hidden;
  }
  .art {
    position: absolute;
    inset: 3px 3px 12px 3px;
    border-radius: 3px;
    background: linear-gradient(180deg, #cfeff4 0%, #a9dee9 52%, #4a9cb4 53%, #4a9cb4 74%, #f3e4ba 75%);
    overflow: hidden;
  }
  .sun {
    position: absolute;
    right: 14%;
    top: 14%;
    width: 13%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #ffe9b8;
  }
  .sea {
    position: absolute;
    left: 0;
    right: 0;
    top: 58%;
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
  }
  .sand {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 22%;
    background: #f3e4ba;
  }
  .light {
    position: absolute;
    left: 12%;
    bottom: 18%;
    width: 9%;
    height: 40%;
    background: #fff8ec;
    border: 1px solid #2a2035;
    border-radius: 2px 2px 0 0;
    border-top: 4px solid #e4572e;
  }
  .boat {
    position: absolute;
    left: 46%;
    bottom: 20%;
    font-size: 9px;
    line-height: 1;
  }
  .stamp {
    position: absolute;
    right: 3px;
    bottom: 2px;
    font-size: 8px;
    line-height: 1;
    opacity: 0.75;
  }
</style>
