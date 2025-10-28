using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain.Entities;

namespace Api.Data
{
    public static class MilitaryRankSeeder
    {
        public static async Task SeedMilitaryRanks(AppDbContext context)
        {
            if (await context.MilitaryRanks.AnyAsync())
                return; // Already seeded

            var ranks = new List<MilitaryRank>
            {
                new MilitaryRank { Code = "HV_ISTH_ASB_BCVS", DisplayName = "Hv.İsth.Asb.Bçvş", SortOrder = 1, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_ASB_KD_BCVS", DisplayName = "Hv.İsth.Asb.Kd.Bçvş", SortOrder = 2, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_ASB_KD_BCVS_OKTAY", DisplayName = "Hv.İsth.Asb.Kd.Bçvş.Oktay ÇAYIR", SortOrder = 3, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_ASB_KD_CVS", DisplayName = "Hv.İsth.Asb.Kd.Çvş", SortOrder = 4, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_ASB_KD_UCVS", DisplayName = "Hv.İsth.Asb.Kd.Üçvş", SortOrder = 5, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_ASB_CVS", DisplayName = "Hv.İsth.Asb.Çvş", SortOrder = 6, IsActive = true },
                new MilitaryRank { Code = "HV_ISTH_UTGM", DisplayName = "Hv.İsth.Ütğm", SortOrder = 7, IsActive = true },
                new MilitaryRank { Code = "HV_MU_ASB_BCVS", DisplayName = "Hv.Mu.Asb.Bçvş", SortOrder = 8, IsActive = true },
                new MilitaryRank { Code = "HV_MU_ASB_KD_BCVS", DisplayName = "Hv.Mu.Asb.Kd.Bçvş", SortOrder = 9, IsActive = true },
                new MilitaryRank { Code = "HV_MU_ASB_KD_CVS", DisplayName = "Hv.Mu.Asb.Kd.Çvş", SortOrder = 10, IsActive = true },
                new MilitaryRank { Code = "HV_MU_ASB_KD_UCVS", DisplayName = "Hv.Mu.Asb.Kd.Üçvş", SortOrder = 11, IsActive = true },
                new MilitaryRank { Code = "HV_MU_ASB_CVS", DisplayName = "Hv.Mu.Asb.Çvş", SortOrder = 12, IsActive = true },
                new MilitaryRank { Code = "HV_MUH_YZB", DisplayName = "Hv.Müh.Yzb", SortOrder = 13, IsActive = true },
                new MilitaryRank { Code = "HV_MUH_UTGM", DisplayName = "Hv.Müh.Ütğm", SortOrder = 14, IsActive = true },
                new MilitaryRank { Code = "HV_SVN_ASB_KD_UCVS", DisplayName = "Hv.Svn.Asb.Kd.Üçvş", SortOrder = 15, IsActive = true }
            };

            await context.MilitaryRanks.AddRangeAsync(ranks);
            await context.SaveChangesAsync();
        }
    }
}