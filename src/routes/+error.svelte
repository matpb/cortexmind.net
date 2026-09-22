<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="wrap page-head">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message}</p>
</div>
